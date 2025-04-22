import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { erc20Abi, formatUnits } from 'viem';
import { usePublicClient, useAccount } from 'wagmi';

import { useAssetPrices } from '../useAssetPrices';

import { bribeRewardsAbi } from '@ionicprotocol/sdk';

// Define contract addresses
export const VOTER_CONTRACT_ADDRESSES = {
  8453: '0x669A6F5421dA53696fa06f1043CF127d380f6EB9', // Base
  34443: '0x141F7f2aa313Ff4C60Dd58fDe493aA2048170429', // Mode
  1135: '0x8865E0678E3b1BD0F5302e4C178a4B576F6aAA27' // Lisk
};

// Incentives viewer contract addresses - CORRECT ADDRESSES
export const INCENTIVES_VIEWER_ADDRESSES = {
  8453: '0xFEF51b9B5a1050B2bBE52A39cC356dfCEE79D87B', // Base
  34443: '0x0286bf00b6f6Cc45D2bd7e8C2e728B1DF2854c7D', // Mode
  1135: '0x8865E0678E3b1BD0F5302e4C178a4B576F6aAA27' // Lisk - Using Voter as incentives viewer
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
            internalType: 'uint256[]',
            name: 'rewardsSupplyETHValues',
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
          },
          {
            internalType: 'uint256[]',
            name: 'rewardsBorrowETHValues',
            type: 'uint256[]'
          }
        ],
        internalType: 'struct VoterLens.IncentiveInfo[]',
        name: '_incentiveInfo',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;
export interface TokenConfig {
  cgId: string;
  symbol: string;
  address?: string;
}
export interface RewardTokenInfo {
  address: string;
  symbol: string;
  name: string;
  cgId: string;
  balance: string;
  decimals: number;
  price?: number;
  underlying_address?: string;
}

// Define interface for the incentive info from the contract - EXACTLY MATCHING ENGINEER'S STRUCT
export interface IncentiveInfo {
  market: `0x${string}`;
  bribeSupply: `0x${string}`;
  rewardsSupply: `0x${string}`[];
  rewardsSupplyAmounts: bigint[];
  rewardsSupplyETHValues: bigint[]; // Added field
  bribeBorrow: `0x${string}`;
  rewardsBorrow: `0x${string}`[];
  rewardsBorrowAmounts: bigint[];
  rewardsBorrowETHValues: bigint[]; // Added field
}

// New types for Market Token Details
export interface TokenDetail {
  tokenAddress: `0x${string}`;
  amount: bigint;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  formattedAmount: string;
  usdValue: number; // Added USD value for each token
}

export interface MarketSideTokens {
  supply: TokenDetail[];
  borrow: TokenDetail[];
  supplyUsdTotal: number; // Added total USD value for supply tokens
  borrowUsdTotal: number; // Added total USD value for borrow tokens
}

export type MarketTokensDetails = Record<string, MarketSideTokens>;

// Added new type for incentives data with USD values
export interface IncentivesData {
  supply: number;
  borrow: number;
  supplyUsd: number;
  borrowUsd: number;
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
    Record<string, IncentivesData>
  >({});
  const [bribesMap, setBribesMap] = useState<
    Record<string, { supplyBribe: string; borrowBribe: string }>
  >({});
  const [rewardTokens, setRewardTokens] = useState<string[]>([]);
  const [rewardTokensInfo, setRewardTokensInfo] = useState<RewardTokenInfo[]>(
    []
  );
  const [marketTokensDetails, setMarketTokensDetails] =
    useState<MarketTokensDetails>({});
  const [tokenAddresses, setTokenAddresses] = useState<string[]>([]);

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

  // Use the useAssetPrices hook to fetch token prices
  const { data: assetPricesResponse } = useAssetPrices({
    chainId: chain,
    tokens: tokenAddresses
  });

  // Create a map of token addresses to prices
  const tokenPricesMap = useMemo(() => {
    const prices: Record<string, number> = {};

    if (assetPricesResponse?.data) {
      assetPricesResponse.data.forEach((asset) => {
        if (asset.underlying_address) {
          prices[asset.underlying_address.toLowerCase()] =
            asset.info.usdPrice || 0;
        }
      });
    }

    return prices;
  }, [assetPricesResponse]);

  // Reset tracking when key dependencies change
  useEffect(() => {
    hasFetchedIncentivesRef.current = false;
    setRewardTokens([]);
    setIncentivesData({});
    setBribesMap({});
    setMarketTokensDetails({});
    setTokenAddresses([]);
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
        const newIncentivesData: Record<string, IncentivesData> = {};
        const newBribesMap: Record<
          string,
          { supplyBribe: string; borrowBribe: string }
        > = {};
        const newRawMarketTokensDetails: Record<
          string,
          {
            supply: { tokenAddress: `0x${string}`; amount: bigint }[];
            borrow: { tokenAddress: `0x${string}`; amount: bigint }[];
          }
        > = {};

        // Collect all unique token addresses for batch fetching
        const allTokenAddresses = new Set<`0x${string}`>();

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

          // Store base values (we'll add USD values after fetching prices)
          newIncentivesData[marketAddress] = {
            supply: supplyValue,
            borrow: borrowValue,
            supplyUsd: 0, // Will be updated later
            borrowUsd: 0 // Will be updated later
          };

          // Store bribe addresses
          newBribesMap[marketAddress] = {
            supplyBribe: info.bribeSupply,
            borrowBribe: info.bribeBorrow
          };

          // Store raw token details for this market and collect token addresses
          newRawMarketTokensDetails[marketAddress] = {
            supply: info.rewardsSupply.map((address, index) => {
              allTokenAddresses.add(address);
              return {
                tokenAddress: address,
                amount: info.rewardsSupplyAmounts[index] || BigInt(0)
              };
            }),
            borrow: info.rewardsBorrow.map((address, index) => {
              allTokenAddresses.add(address);
              return {
                tokenAddress: address,
                amount: info.rewardsBorrowAmounts[index] || BigInt(0)
              };
            })
          };
        }

        // Store token addresses for price fetching with useAssetPrices
        setTokenAddresses(Array.from(allTokenAddresses));

        // Update state with bribes map
        setBribesMap(newBribesMap);

        // Now fetch token information for all unique token addresses
        if (allTokenAddresses.size > 0) {
          const tokenAddressesArray = Array.from(allTokenAddresses);
          await fetchTokenDetails(
            tokenAddressesArray,
            newRawMarketTokensDetails,
            newIncentivesData
          );
        } else {
          setMarketTokensDetails({});
          setIncentivesData(newIncentivesData);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching incentives data:', err);
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
        hasFetchedIncentivesRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncentives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient, incentivesViewerAddress, normalizedMarketAddresses]);

  // Update market tokens details and incentives data when prices change
  useEffect(() => {
    const updateWithPrices = async () => {
      if (!tokenPricesMap || Object.keys(tokenPricesMap).length === 0) return;

      // Create a copy of the current marketTokensDetails state
      const updatedMarketTokensDetails = { ...marketTokensDetails };
      const updatedIncentivesData = { ...incentivesData };

      // Update each market's token prices and USD values
      Object.keys(updatedMarketTokensDetails).forEach((marketAddress) => {
        let supplyUsdTotal = 0;
        let borrowUsdTotal = 0;

        // Update supply tokens
        const updatedSupplyTokens = updatedMarketTokensDetails[
          marketAddress
        ].supply.map((token) => {
          const price = tokenPricesMap[token.tokenAddress.toLowerCase()] || 0;
          const formattedAmount = Number(token.formattedAmount);
          const usdValue = formattedAmount * price;

          supplyUsdTotal += usdValue;

          return {
            ...token,
            price,
            usdValue
          };
        });

        // Update borrow tokens
        const updatedBorrowTokens = updatedMarketTokensDetails[
          marketAddress
        ].borrow.map((token) => {
          const price = tokenPricesMap[token.tokenAddress.toLowerCase()] || 0;
          const formattedAmount = Number(token.formattedAmount);
          const usdValue = formattedAmount * price;

          borrowUsdTotal += usdValue;

          return {
            ...token,
            price,
            usdValue
          };
        });

        // Update the market's tokens and USD totals
        updatedMarketTokensDetails[marketAddress] = {
          supply: updatedSupplyTokens,
          borrow: updatedBorrowTokens,
          supplyUsdTotal,
          borrowUsdTotal
        };

        // Update incentives USD values
        if (updatedIncentivesData[marketAddress]) {
          updatedIncentivesData[marketAddress].supplyUsd = supplyUsdTotal;
          updatedIncentivesData[marketAddress].borrowUsd = borrowUsdTotal;
        }
      });

      // Update state
      setMarketTokensDetails(updatedMarketTokensDetails);
      setIncentivesData(updatedIncentivesData);
    };

    updateWithPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenPricesMap]);

  // Function to fetch token details (symbol, name, decimals) for all token addresses
  const fetchTokenDetails = async (
    tokenAddresses: `0x${string}`[],
    rawMarketTokens: Record<
      string,
      {
        supply: { tokenAddress: `0x${string}`; amount: bigint }[];
        borrow: { tokenAddress: `0x${string}`; amount: bigint }[];
      }
    >,
    baseIncentivesData: Record<string, IncentivesData>
  ) => {
    if (!publicClient || tokenAddresses.length === 0) {
      return;
    }

    try {
      // Prepare calls for token details
      const symbolCalls = tokenAddresses.map((address) => ({
        address,
        abi: erc20Abi,
        functionName: 'symbol'
      }));

      const nameCalls = tokenAddresses.map((address) => ({
        address,
        abi: erc20Abi,
        functionName: 'name'
      }));

      const decimalsCalls = tokenAddresses.map((address) => ({
        address,
        abi: erc20Abi,
        functionName: 'decimals'
      }));

      // Execute all calls in one multicall
      const results = await publicClient.multicall({
        contracts: [...symbolCalls, ...nameCalls, ...decimalsCalls],
        allowFailure: true
      });

      // Process results
      const tokenCount = tokenAddresses.length;
      const tokenDetailsMap = new Map<
        string,
        {
          symbol: string;
          name: string;
          decimals: number;
        }
      >();

      for (let i = 0; i < tokenCount; i++) {
        const address = tokenAddresses[i].toLowerCase();

        // Get symbol
        let symbol = 'Unknown';
        if (results[i].status === 'success') {
          symbol = results[i].result as string;
        }

        // Get name
        let name = 'Unknown Token';
        if (results[i + tokenCount].status === 'success') {
          name = results[i + tokenCount].result as string;
        }

        // Get decimals
        let decimals = 18;
        if (results[i + 2 * tokenCount].status === 'success') {
          decimals = Number(results[i + 2 * tokenCount].result);
        }

        tokenDetailsMap.set(address, {
          symbol,
          name,
          decimals
        });
      }

      // Create tokens info for the dropdown
      const tokensInfo: RewardTokenInfo[] = tokenAddresses.map((address) => {
        const addressLower = address.toLowerCase();
        const details = tokenDetailsMap.get(addressLower);

        return {
          address,
          symbol: details?.symbol || 'Unknown',
          name: details?.name || 'Unknown Token',
          cgId: details?.symbol?.toLowerCase() || 'unknown',
          balance: '0',
          decimals: details?.decimals || 18,
          underlying_address: address
        };
      });

      setRewardTokensInfo(tokensInfo);

      // Build market tokens details with token info (prices will be updated in useEffect later)
      const enhancedMarketTokensDetails: MarketTokensDetails = {};

      // Process each market
      Object.entries(rawMarketTokens).forEach(([marketAddress, sides]) => {
        // Process supply tokens
        const supplyTokens = sides.supply.map((token) => {
          const tokenAddress = token.tokenAddress.toLowerCase();
          const details = tokenDetailsMap.get(tokenAddress);
          const decimals = details?.decimals || 18;

          return {
            tokenAddress: token.tokenAddress,
            amount: token.amount,
            symbol: details?.symbol || 'Unknown',
            name: details?.name || 'Unknown Token',
            decimals,
            price: 0, // Will be updated with prices from useAssetPrices
            formattedAmount: formatUnits(token.amount, decimals),
            usdValue: 0 // Will be updated with prices from useAssetPrices
          };
        });

        // Process borrow tokens
        const borrowTokens = sides.borrow.map((token) => {
          const tokenAddress = token.tokenAddress.toLowerCase();
          const details = tokenDetailsMap.get(tokenAddress);
          const decimals = details?.decimals || 18;

          return {
            tokenAddress: token.tokenAddress,
            amount: token.amount,
            symbol: details?.symbol || 'Unknown',
            name: details?.name || 'Unknown Token',
            decimals,
            price: 0, // Will be updated with prices from useAssetPrices
            formattedAmount: formatUnits(token.amount, decimals),
            usdValue: 0 // Will be updated with prices from useAssetPrices
          };
        });

        // Store tokens with initial totals
        enhancedMarketTokensDetails[marketAddress] = {
          supply: supplyTokens,
          borrow: borrowTokens,
          supplyUsdTotal: 0, // Will be updated later
          borrowUsdTotal: 0 // Will be updated later
        };
      });

      setMarketTokensDetails(enhancedMarketTokensDetails);
      setIncentivesData(baseIncentivesData);
    } catch (err) {
      console.error('Error fetching token details:', err);

      // Set default values on error
      const defaultMarketTokensDetails: MarketTokensDetails = {};

      Object.entries(rawMarketTokens).forEach(([marketAddress, sides]) => {
        defaultMarketTokensDetails[marketAddress] = {
          supply: sides.supply.map((token) => ({
            tokenAddress: token.tokenAddress,
            amount: token.amount,
            symbol: 'Unknown',
            name: 'Unknown Token',
            decimals: 18,
            price: 0,
            formattedAmount: formatUnits(token.amount, 18),
            usdValue: 0
          })),
          borrow: sides.borrow.map((token) => ({
            tokenAddress: token.tokenAddress,
            amount: token.amount,
            symbol: 'Unknown',
            name: 'Unknown Token',
            decimals: 18,
            price: 0,
            formattedAmount: formatUnits(token.amount, 18),
            usdValue: 0
          })),
          supplyUsdTotal: 0,
          borrowUsdTotal: 0
        };
      });

      setMarketTokensDetails(defaultMarketTokensDetails);
      setIncentivesData(baseIncentivesData);
    }
  };

  // Get market incentives in USD
  const getMarketIncentivesUsd = useCallback(
    (marketAddress: string, side: 'borrow' | 'supply'): number => {
      const normalizedAddress = marketAddress.toLowerCase();
      return side === 'supply'
        ? incentivesData[normalizedAddress]?.supplyUsd || 0
        : incentivesData[normalizedAddress]?.borrowUsd || 0;
    },
    [incentivesData]
  );

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
              cgId: symbol.toLowerCase(),
              balance,
              decimals,
              underlying_address: address
            });
          }

          setRewardTokensInfo(tokenInfo);

          // Update token addresses for price fetching if needed
          if (tokenAddresses.length > 0) {
            setTokenAddresses((prev) => {
              const newAddresses = new Set([...prev, ...tokenAddresses]);
              return Array.from(newAddresses);
            });
          }
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

  // Get token details for a specific market and side
  const getMarketTokenDetails = useCallback(
    (marketAddress: string, side: 'borrow' | 'supply'): TokenDetail[] => {
      const normalizedAddress = marketAddress.toLowerCase();
      return marketTokensDetails[normalizedAddress]?.[side] || [];
    },
    [marketTokensDetails]
  );

  // Combined token info with prices from useAssetPrices
  const rewardTokensWithInfo = useMemo(() => {
    return rewardTokensInfo.map((token) => {
      const price = token.underlying_address
        ? tokenPricesMap[token.underlying_address.toLowerCase()] || 0
        : 0;

      return {
        ...token,
        price
      };
    });
  }, [rewardTokensInfo, tokenPricesMap]);

  return {
    incentivesData,
    bribesMap,
    rewardTokens,
    rewardTokensInfo: rewardTokensWithInfo,
    marketTokensDetails,
    getMarketIncentives,
    getBribeAddress,
    getMarketTokenDetails,
    fetchRewardTokensForBribe,
    getMarketIncentivesUsd,
    isLoading,
    error
  };
};
