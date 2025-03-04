import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { erc20Abi, formatUnits } from 'viem';
import { usePublicClient, useAccount } from 'wagmi';

// Add iVoterViewAbi
export const iVoterViewAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'market', internalType: 'address', type: 'address' },
      {
        name: 'marketSide',
        internalType: 'enum IVoter.MarketSide',
        type: 'uint8'
      }
    ],
    name: 'marketToRewardAccumulators',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    inputs: [
      { name: 'rewardAccumulator', internalType: 'address', type: 'address' }
    ],
    name: 'rewardAccumulatorToBribe',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view'
  }
] as const;

// Define Voter contract addresses
export const VOTER_CONTRACT_ADDRESSES = {
  8453: '0x669A6F5421dA53696fa06f1043CF127d380f6EB9', // Base
  34443: '0x141F7f2aa313Ff4C60Dd58fDe493aA2048170429' // Mode
};

import { MarketSide } from '@ui/types/veION';

import { bribeRewardsAbi } from '@ionicprotocol/sdk';

// Supabase client for token prices
const supabaseUrl = 'https://uoagtjstsdrjypxlkuzr.supabase.co/';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface TokenConfig {
  cgId: string;
  symbol: string;
  address?: string;
}

interface TokenPrice {
  symbol: string;
  price: number;
}

interface AssetPrice {
  chain_id: string;
  created_at: string;
  info: {
    usdPrice: number;
    symbol?: string;
  };
}

// Function to fetch token prices from Supabase
async function fetchTokenPrices(tokens: TokenConfig[]) {
  const prices: Record<string, TokenPrice> = {};

  if (tokens.length === 0) return prices;

  try {
    const { data: latestPrices, error } = await supabase
      .from('asset-price')
      .select('*')
      .in(
        'chain_id',
        tokens.map((t) => t.cgId)
      )
      .order('created_at', { ascending: false });

    if (error) throw error;

    const latestByToken = new Map<string, AssetPrice>();
    latestPrices?.forEach((price) => {
      if (!latestByToken.has(price.chain_id)) {
        latestByToken.set(price.chain_id, price);
      }
    });

    tokens.forEach((token) => {
      const priceData = latestByToken.get(token.cgId);
      const price = priceData?.info.usdPrice ?? 0;

      prices[token.symbol] = {
        symbol: token.symbol,
        price: Number.isFinite(price) ? price : 0
      };

      // Set default price of 1 for stablecoins if we got 0
      if (
        price === 0 &&
        (token.symbol === 'USDC' ||
          token.symbol === 'USDT' ||
          token.symbol === 'DAI')
      ) {
        prices[token.symbol].price = 1;
      }
    });

    return prices;
  } catch (error) {
    console.error('Failed to fetch token prices:', error);

    // Return default prices in case of complete failure
    tokens.forEach((token) => {
      prices[token.symbol] = {
        symbol: token.symbol,
        price:
          token.symbol === 'USDC' ||
          token.symbol === 'USDT' ||
          token.symbol === 'DAI'
            ? 1
            : 0
      };
    });

    return prices;
  }
}

export interface RewardTokenInfo {
  address: string;
  symbol: string;
  name: string;
  cgId: string;
  balance: string;
  decimals: number;
}

export const useMarketIncentives = (
  chain: number,
  marketAddresses: string[] = [],
  selectedSide: '' | 'borrow' | 'supply',
  selectedMarket?: string
) => {
  const publicClient = usePublicClient({ chainId: chain });
  const { address: userAddress } = useAccount();
  const [incentivesData, setIncentivesData] = useState<
    Record<string, { supply: number; borrow: number }>
  >({});
  const [bribesMap, setBribesMap] = useState<
    Record<string, { supplyBribe: string; borrowBribe: string }>
  >({});
  const [rewardTokens, setRewardTokens] = useState<string[]>([]);
  const [rewardTokensInfo, setRewardTokensInfo] = useState<RewardTokenInfo[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track if we've already fetched data to prevent excessive fetches
  const hasFetchedBribesRef = useRef(false);
  const hasFetchedIncentivesRef = useRef(false);

  // Track selected market/side to detect changes
  const previousMarketRef = useRef<string | undefined>();
  const previousSideRef = useRef<'borrow' | 'supply' | undefined>();

  // Get Voter address for the chain - memoized
  const voterAddress = useMemo(
    () =>
      VOTER_CONTRACT_ADDRESSES[chain as keyof typeof VOTER_CONTRACT_ADDRESSES],
    [chain]
  );

  // Prepare normalized market addresses for consistency - memoized
  const normalizedMarketAddresses = useMemo(() => {
    if (!marketAddresses.length) return [];
    return marketAddresses.map((addr) => addr.toLowerCase());
  }, [marketAddresses]);

  // Reset tracking when key dependencies change
  useEffect(() => {
    hasFetchedBribesRef.current = false;
    hasFetchedIncentivesRef.current = false;
    setRewardTokens([]);
  }, [chain, normalizedMarketAddresses.length]);

  // Fetch bribe addresses for all markets using the Voter contract
  useEffect(() => {
    // Skip if already fetched bribes with these params
    if (
      hasFetchedBribesRef.current ||
      !publicClient ||
      !normalizedMarketAddresses.length ||
      !voterAddress
    )
      return;

    const fetchBribes = async () => {
      try {
        setIsLoading(true);
        // Mark as fetched at the beginning to prevent duplicate fetches
        hasFetchedBribesRef.current = true;

        // Create calls to get reward accumulator for each market and side
        const accumulatorCalls = [];

        for (const market of normalizedMarketAddresses) {
          // Call for supply side (0)
          accumulatorCalls.push({
            address: voterAddress as `0x${string}`,
            abi: iVoterViewAbi,
            functionName: 'marketToRewardAccumulators',
            args: [market as `0x${string}`, MarketSide.Supply]
          });

          // Call for borrow side (1)
          accumulatorCalls.push({
            address: voterAddress as `0x${string}`,
            abi: iVoterViewAbi,
            functionName: 'marketToRewardAccumulators',
            args: [market as `0x${string}`, MarketSide.Borrow]
          });
        }

        // Execute multicall to get all accumulators
        const accumulatorResults = await publicClient.multicall({
          contracts: accumulatorCalls,
          allowFailure: true
        });

        // Create calls to get bribe contract for each accumulator
        const bribeCalls = [];
        const validAccumulators = [];

        for (const result of accumulatorResults as any[]) {
          if (result.status === 'success' && result.result) {
            const accumulator = result.result as `0x${string}`;
            validAccumulators.push(accumulator);

            bribeCalls.push({
              address: voterAddress as `0x${string}`,
              abi: iVoterViewAbi,
              functionName: 'rewardAccumulatorToBribe',
              args: [accumulator]
            });
          } else {
            // Push null for failed results to maintain array indexes
            validAccumulators.push(null);
          }
        }

        // Execute multicall to get all bribe contracts
        const briberResults = await publicClient.multicall({
          contracts: bribeCalls,
          allowFailure: true
        });

        // Process results to build the bribesMap
        const newBribesMap: Record<
          string,
          { supplyBribe: string; borrowBribe: string }
        > = {};

        // Start at beginning of normalizedMarketAddresses
        let resultIndex = 0;
        for (const market of normalizedMarketAddresses) {
          // Get supply accumulator and bribe
          const supplyAccumulator = validAccumulators[resultIndex];
          const supplyBribe = supplyAccumulator
            ? (briberResults[validAccumulators.indexOf(supplyAccumulator)]
                ?.result as unknown as string) ?? ''
            : '';

          resultIndex++;

          // Get borrow accumulator and bribe
          const borrowAccumulator = validAccumulators[resultIndex];
          const borrowBribe = borrowAccumulator
            ? (briberResults[validAccumulators.indexOf(borrowAccumulator)]
                ?.result as unknown as string) ?? ''
            : '';

          resultIndex++;

          // Add to map if we have at least one valid bribe contract
          if (supplyBribe || borrowBribe) {
            newBribesMap[market] = {
              supplyBribe,
              borrowBribe
            };
          }
        }

        // Update bribesMap
        setBribesMap(newBribesMap);

        // Reset fetch tracking for dependent data
        hasFetchedIncentivesRef.current = false;

        setError(null);
      } catch (err) {
        console.error('Error fetching bribe contracts:', err);
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
        // Reset fetch tracking on error to allow retry
        hasFetchedBribesRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchBribes();
  }, [normalizedMarketAddresses, publicClient, voterAddress]);

  // Function to fetch reward tokens for a specific bribe contract
  const fetchRewardTokensForBribe = useCallback(
    async (
      bribeAddress: string | undefined,
      marketAddress: string,
      side: 'borrow' | 'supply'
    ) => {
      if (!bribeAddress || !publicClient) {
        setRewardTokens([]);
        setRewardTokensInfo([]);
        return;
      }

      try {
        setIsLoading(true);

        // First, get the number of reward tokens
        const rewardsLength = (await publicClient.readContract({
          address: bribeAddress as `0x${string}`,
          abi: bribeRewardsAbi,
          functionName: 'rewardsListLength'
        })) as bigint;

        // Now fetch each reward token address
        const calls = [];

        for (let i = 0; i < Number(rewardsLength); i++) {
          calls.push({
            address: bribeAddress as `0x${string}`,
            abi: bribeRewardsAbi,
            functionName: 'rewards',
            args: [BigInt(i)]
          });
        }

        const tokenAddresses: string[] = [];

        if (calls.length > 0) {
          const results = await publicClient.multicall({
            contracts: calls,
            allowFailure: true
          });

          results.forEach((result) => {
            if (result.status === 'success') {
              tokenAddresses.push(result.result as string);
            }
          });
        }

        // Set the token addresses
        setRewardTokens(tokenAddresses);

        // Fetch symbol and balance for each token
        if (tokenAddresses.length > 0 && userAddress) {
          const symbolCalls = tokenAddresses.map((tokenAddress) => ({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'symbol'
          }));

          const nameCalls = tokenAddresses.map((tokenAddress) => ({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'name'
          }));

          const balanceCalls = tokenAddresses.map((tokenAddress) => ({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [userAddress as `0x${string}`]
          }));

          const decimalsCalls = tokenAddresses.map((tokenAddress) => ({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: 'decimals'
          }));

          const allCalls = [
            ...symbolCalls,
            ...nameCalls,
            ...balanceCalls,
            ...decimalsCalls
          ];

          const results = await publicClient.multicall({
            contracts: allCalls,
            allowFailure: true
          });

          const tokenCount = tokenAddresses.length;
          const tokenInfo: RewardTokenInfo[] = [];

          for (let i = 0; i < tokenCount; i++) {
            const address = tokenAddresses[i];

            // Get symbol from result
            let symbol = 'Unknown';
            if (results[i].status === 'success') {
              symbol = results[i].result as string;
            }

            // Get name as fallback or for CoinGecko ID
            let name = '';
            if (results[i + tokenCount].status === 'success') {
              name = results[i + tokenCount].result as string;
            }

            // Generate a CoinGecko ID from symbol or name
            // This is a best-effort approach since there's no direct mapping
            const cgId =
              symbol.toLowerCase() || name.toLowerCase().replace(/\s+/g, '-');

            // Get balance
            let balance = '0';
            let decimals = 18;

            if (results[i + 2 * tokenCount].status === 'success') {
              const rawBalance = results[i + 2 * tokenCount].result as bigint;

              if (results[i + 3 * tokenCount].status === 'success') {
                decimals = Number(results[i + 3 * tokenCount].result as number);
              }

              balance = formatUnits(rawBalance, decimals);
            }

            tokenInfo.push({
              address,
              symbol,
              name,
              cgId,
              balance,
              decimals
            });
          }

          setRewardTokensInfo(tokenInfo);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching reward tokens:', err);
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
        setRewardTokens([]);
        setRewardTokensInfo([]);
      } finally {
        setIsLoading(false);
      }
    },
    [publicClient, userAddress]
  );

  // Effect to fetch reward tokens when selected market and side change
  useEffect(() => {
    // Only fetch if we have a selected market and side
    if (
      !selectedMarket ||
      !selectedSide ||
      !bribesMap[selectedMarket.toLowerCase()]
    ) {
      setRewardTokens([]);
      return;
    }

    // Check if we need to fetch new tokens (market or side changed)
    const marketChanged = previousMarketRef.current !== selectedMarket;
    const sideChanged = previousSideRef.current !== selectedSide;

    if (marketChanged || sideChanged) {
      // Update refs
      previousMarketRef.current = selectedMarket;
      previousSideRef.current = selectedSide;

      // Get the appropriate bribe address
      const normalizedMarket = selectedMarket.toLowerCase();
      const bribeAddress =
        selectedSide === 'supply'
          ? bribesMap[normalizedMarket]?.supplyBribe
          : bribesMap[normalizedMarket]?.borrowBribe;

      // Fetch reward tokens for this specific market/side
      fetchRewardTokensForBribe(bribeAddress, normalizedMarket, selectedSide);
    }
  }, [selectedMarket, selectedSide, bribesMap, fetchRewardTokensForBribe]);

  // Fetch incentives for markets once we have the bribe addresses and reward tokens
  useEffect(() => {
    // Skip if already fetched with these params
    if (
      hasFetchedIncentivesRef.current ||
      !publicClient ||
      !normalizedMarketAddresses.length ||
      Object.keys(bribesMap).length === 0
    )
      return;

    const fetchIncentives = async () => {
      try {
        setIsLoading(true);
        // Mark as fetched at the beginning to prevent duplicate fetches
        hasFetchedIncentivesRef.current = true;

        // Prepare calls for all markets and tokens
        const calls = [];
        const marketBribeMap: Record<
          number,
          { market: string; side: 'borrow' | 'supply' }
        > = {};
        let callIndex = 0;

        // Add supply calls
        for (const market of normalizedMarketAddresses) {
          if (!bribesMap[market]?.supplyBribe) continue;

          for (const token of rewardTokens) {
            calls.push({
              address: bribesMap[market].supplyBribe as `0x${string}`,
              abi: bribeRewardsAbi,
              functionName: 'totalSupply',
              args: [token]
            });

            marketBribeMap[callIndex] = { market, side: 'supply' };
            callIndex++;
          }
        }

        // Add borrow calls
        for (const market of normalizedMarketAddresses) {
          if (!bribesMap[market]?.borrowBribe) continue;

          for (const token of rewardTokens) {
            calls.push({
              address: bribesMap[market].borrowBribe as `0x${string}`,
              abi: bribeRewardsAbi,
              functionName: 'totalSupply',
              args: [token]
            });

            marketBribeMap[callIndex] = { market, side: 'borrow' };
            callIndex++;
          }
        }

        if (calls.length === 0) {
          setIsLoading(false);
          return;
        }

        // Execute multicall
        const results = await publicClient.multicall({
          contracts: calls,
          allowFailure: true
        });

        // Process results
        const newIncentivesData: Record<
          string,
          { supply: number; borrow: number }
        > = {};

        // Initialize data structure
        normalizedMarketAddresses.forEach((market) => {
          newIncentivesData[market] = { supply: 0, borrow: 0 };
        });

        // Aggregate results
        results.forEach((result, index) => {
          if (result.status !== 'success') return;

          const { market, side } = marketBribeMap[index];
          const value = Number(formatUnits(result.result as bigint, 18)); // Assuming 18 decimals

          if (!newIncentivesData[market]) {
            newIncentivesData[market] = { supply: 0, borrow: 0 };
          }

          newIncentivesData[market][side] += value;
        });

        setIncentivesData(newIncentivesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching incentives data:', err);
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
        // Reset fetch tracking on error to allow retry
        hasFetchedIncentivesRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncentives();
  }, [normalizedMarketAddresses, rewardTokens, publicClient, bribesMap]);

  // Helper functions - memoized to maintain reference stability
  const getMarketIncentives = useCallback(
    (marketAddress: string, side: 'borrow' | 'supply'): number => {
      const normalizedAddress = marketAddress.toLowerCase();
      return incentivesData[normalizedAddress]?.[side] || 0;
    },
    [incentivesData]
  );

  const getBribeAddress = useCallback(
    (marketAddress: string, side: 'borrow' | 'supply'): string | undefined => {
      const normalizedAddress = marketAddress.toLowerCase();
      return side === 'supply'
        ? bribesMap[normalizedAddress]?.supplyBribe
        : bribesMap[normalizedAddress]?.borrowBribe;
    },
    [bribesMap]
  );

  // Hook to fetch token prices from Supabase
  const { data: tokenPrices } = useQuery({
    queryKey: ['tokenPrices', chain, rewardTokensInfo.map((t) => t.cgId)],
    queryFn: async () => {
      const tokens: TokenConfig[] = rewardTokensInfo.map((tokenInfo) => {
        return {
          cgId: tokenInfo.cgId,
          symbol: tokenInfo.symbol,
          address: tokenInfo.address
        };
      });

      return fetchTokenPrices(tokens);
    },
    enabled: rewardTokensInfo.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  });

  // Combined token info with prices
  const rewardTokensWithInfo = useMemo(() => {
    return rewardTokensInfo.map((token) => {
      const price = tokenPrices?.[token.symbol]?.price || 0;
      return {
        ...token,
        price
      };
    });
  }, [rewardTokensInfo, tokenPrices]);

  return {
    incentivesData,
    bribesMap,
    rewardTokens,
    rewardTokensInfo: rewardTokensWithInfo,
    getMarketIncentives,
    getBribeAddress,
    fetchRewardTokensForBribe,
    isLoading,
    error
  };
};
