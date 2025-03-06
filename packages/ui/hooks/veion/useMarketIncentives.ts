import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { erc20Abi, formatUnits } from 'viem';
import { usePublicClient, useAccount } from 'wagmi';

// Define contract addresses
export const VOTER_CONTRACT_ADDRESSES = {
  8453: '0x669A6F5421dA53696fa06f1043CF127d380f6EB9', // Base
  34443: '0x141F7f2aa313Ff4C60Dd58fDe493aA2048170429' // Mode
};

// Incentives viewer contract addresses - CORRECT ADDRESSES
export const INCENTIVES_VIEWER_ADDRESSES = {
  8453: '0x0E6F5bb82ba499A3FdAE6449c00A2936286bbf02', // Base
  34443: '0xDf6b5b001D7658E35EfBfD2950A5E5a92A1f32E6' // Mode
};

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

// Incentives viewer ABI with exact struct from the engineer
export const incentivesViewerAbi = [
  {
    inputs: [],
    name: 'getAllIncentivesForBribes',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'market',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'bribeSupply',
            type: 'address'
          },
          {
            internalType: 'address[]',
            name: 'rewardsSupply',
            type: 'address[]'
          },
          {
            internalType: 'uint256[]',
            name: 'rewardsSupplyAmounts',
            type: 'uint256[]'
          },
          {
            internalType: 'address',
            name: 'bribeBorrow',
            type: 'address'
          },
          {
            internalType: 'address[]',
            name: 'rewardsBorrow',
            type: 'address[]'
          },
          {
            internalType: 'uint256[]',
            name: 'rewardsBorrowAmounts',
            type: 'uint256[]'
          }
        ],
        internalType: 'struct IncentiveInfo[]',
        name: '_incentiveInfo',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

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
  price?: number;
}

// Define interface for the incentive info from the contract - EXACTLY MATCHING ENGINEER'S STRUCT
export interface IncentiveInfo {
  market: `0x${string}`;
  bribeSupply: `0x${string}`;
  rewardsSupply: `0x${string}`[];
  rewardsSupplyAmounts: bigint[];
  bribeBorrow: `0x${string}`;
  rewardsBorrow: `0x${string}`[];
  rewardsBorrowAmounts: bigint[];
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
  const hasFetchedIncentivesRef = useRef(false);

  // Track selected market/side to detect changes
  const previousMarketRef = useRef<string | undefined>();
  const previousSideRef = useRef<'borrow' | 'supply' | undefined>();

  // Get incentives viewer address for the chain
  const incentivesViewerAddress = useMemo(
    () =>
      INCENTIVES_VIEWER_ADDRESSES[
        chain as keyof typeof INCENTIVES_VIEWER_ADDRESSES
      ],
    [chain]
  );

  // Prepare normalized market addresses for consistency
  const normalizedMarketAddresses = useMemo(() => {
    if (!marketAddresses.length) return [];
    return marketAddresses.map((addr) => addr.toLowerCase());
  }, [marketAddresses]);

  // Reset tracking when key dependencies change
  useEffect(() => {
    hasFetchedIncentivesRef.current = false;
    setRewardTokens([]);
    setIncentivesData({});
    setBribesMap({});
  }, [chain, normalizedMarketAddresses.length]);

  // SIMPLIFIED: Fetch incentives data directly from the incentives viewer contract
  useEffect(() => {
    if (
      hasFetchedIncentivesRef.current ||
      !publicClient ||
      !incentivesViewerAddress ||
      !normalizedMarketAddresses.length
    ) {
      return;
    }

    const fetchIncentives = async () => {
      try {
        setIsLoading(true);
        hasFetchedIncentivesRef.current = true;

        // Call the getAllIncentivesForBribes function directly
        const incentivesResult = (await publicClient.readContract({
          address: incentivesViewerAddress as `0x${string}`,
          abi: incentivesViewerAbi,
          functionName: 'getAllIncentivesForBribes'
        })) as IncentiveInfo[];

        if (!incentivesResult || !Array.isArray(incentivesResult)) {
          throw new Error('Invalid incentives data format received');
        }

        // Process the incentives data
        const newIncentivesData: Record<
          string,
          { supply: number; borrow: number }
        > = {};
        const newBribesMap: Record<
          string,
          { supplyBribe: string; borrowBribe: string }
        > = {};

        // Process each incentive info
        for (const info of incentivesResult) {
          const marketAddress = info.market.toLowerCase();

          // Skip if not in our list of markets
          if (!normalizedMarketAddresses.includes(marketAddress)) {
            continue;
          }

          // Calculate supply incentives value (sum of all token amounts)
          let supplyValue = 0;
          if (
            info.rewardsSupplyAmounts &&
            info.rewardsSupplyAmounts.length > 0
          ) {
            for (const amount of info.rewardsSupplyAmounts) {
              try {
                supplyValue += Number(formatUnits(amount, 18));
              } catch (e) {
                console.error('Error formatting supply amount:', e);
              }
            }
          }

          // Calculate borrow incentives value (sum of all token amounts)
          let borrowValue = 0;
          if (
            info.rewardsBorrowAmounts &&
            info.rewardsBorrowAmounts.length > 0
          ) {
            for (const amount of info.rewardsBorrowAmounts) {
              try {
                borrowValue += Number(formatUnits(amount, 18));
              } catch (e) {
                console.error('Error formatting borrow amount:', e);
              }
            }
          }

          // Store the calculated values
          newIncentivesData[marketAddress] = {
            supply: supplyValue,
            borrow: borrowValue
          };

          // Store bribe addresses
          newBribesMap[marketAddress] = {
            supplyBribe: info.bribeSupply,
            borrowBribe: info.bribeBorrow
          };
        }

        // Update state with processed data
        setIncentivesData(newIncentivesData);
        setBribesMap(newBribesMap);
        setError(null);
      } catch (err) {
        console.error('Error fetching incentives data:', err);
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
        hasFetchedIncentivesRef.current = false;

        // Attempt fallback to older method if this fails
        // This section would implement the fallback, but I'm keeping it simple as requested
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncentives();
  }, [publicClient, incentivesViewerAddress, normalizedMarketAddresses]);

  // Function to fetch reward tokens for a specific bribe contract - needed for the dropdown
  const fetchRewardTokensForBribe = useCallback(
    async (bribeAddress: string | undefined) => {
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
      fetchRewardTokensForBribe(bribeAddress);
    }
  }, [selectedMarket, selectedSide, bribesMap, fetchRewardTokensForBribe]);

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
