import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { formatUnits } from 'viem';
import { usePublicClient, useReadContract } from 'wagmi';

import { VOTERLENS_CHAIN_ADDRESSES } from '../rewards/useBribeRewards';

import { voterLensAbi, bribeRewardsAbi } from '@ionicprotocol/sdk';

export const useMarketIncentives = (
  chain: number,
  marketAddresses: string[] = []
) => {
  const publicClient = usePublicClient({ chainId: chain });
  const [incentivesData, setIncentivesData] = useState<
    Record<string, { supply: number; borrow: number }>
  >({});
  const [bribesMap, setBribesMap] = useState<
    Record<string, { supplyBribe: string; borrowBribe: string }>
  >({});
  const [rewardTokens, setRewardTokens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track if we've already fetched data to prevent excessive fetches
  const hasFetchedIncentivesRef = useRef(false);
  const hasFetchedRewardTokensRef = useRef(false);

  // Get VoterLens address for the chain - memoized
  const voterLensAddress = useMemo(
    () =>
      VOTERLENS_CHAIN_ADDRESSES[
        chain as keyof typeof VOTERLENS_CHAIN_ADDRESSES
      ],
    [chain]
  );

  // Prepare normalized market addresses for consistency - memoized
  const normalizedMarketAddresses = useMemo(() => {
    if (!marketAddresses.length) return [];
    return marketAddresses.map((addr) => addr.toLowerCase());
  }, [marketAddresses]);

  // Get bribe addresses for all markets
  const { data: bribes = [], isLoading: isBribesLoading } = useReadContract({
    address: voterLensAddress,
    abi: voterLensAbi,
    functionName: 'getAllBribes',
    chainId: chain,
    query: {
      enabled: Boolean(voterLensAddress),
      staleTime: 60 * 1000 // 1 minute
    }
  });

  // Map market addresses to their bribe addresses
  useEffect(() => {
    if (bribes.length === 0 || isBribesLoading) return;

    // Only update bribesMap if it actually changed
    const newBribesMap: Record<
      string,
      { supplyBribe: string; borrowBribe: string }
    > = {};

    bribes.forEach((bribe) => {
      const marketAddress = bribe.market.toLowerCase();
      newBribesMap[marketAddress] = {
        supplyBribe: bribe.bribeSupply,
        borrowBribe: bribe.bribeBorrow
      };
    });

    // Check if bribesMap has actually changed to avoid unnecessary updates
    const hasChanged =
      Object.keys(newBribesMap).length !== Object.keys(bribesMap).length ||
      Object.keys(newBribesMap).some(
        (market) =>
          !bribesMap[market] ||
          bribesMap[market].supplyBribe !== newBribesMap[market].supplyBribe ||
          bribesMap[market].borrowBribe !== newBribesMap[market].borrowBribe
      );

    if (hasChanged) {
      setBribesMap(newBribesMap);
      // Reset fetch tracking when bribes change
      hasFetchedIncentivesRef.current = false;
      hasFetchedRewardTokensRef.current = false;
    }
  }, [bribes, isBribesLoading, bribesMap]);

  // Fetch reward tokens from a bribe contract
  useEffect(() => {
    // Skip if already fetched reward tokens with these params
    if (
      hasFetchedRewardTokensRef.current ||
      Object.keys(bribesMap).length === 0 ||
      !publicClient
    )
      return;

    const fetchRewardTokens = async () => {
      try {
        setIsLoading(true);

        // Get the first bribe address to fetch reward tokens
        // We assume all bribe contracts have the same reward tokens
        const firstBribeAddress = Object.values(bribesMap)[0]
          ?.supplyBribe as `0x${string}`;

        if (!firstBribeAddress) {
          setIsLoading(false);
          return;
        }

        // First, get the number of reward tokens
        const rewardsLength = (await publicClient.readContract({
          address: firstBribeAddress,
          abi: bribeRewardsAbi,
          functionName: 'rewardsListLength'
        })) as bigint;

        // Now fetch each reward token address one by one
        const tokenAddresses: string[] = [];
        const calls = [];

        for (let i = 0; i < Number(rewardsLength); i++) {
          calls.push({
            address: firstBribeAddress,
            abi: bribeRewardsAbi,
            functionName: 'rewards',
            args: [BigInt(i)]
          });
        }

        if (calls.length > 0) {
          const results = await publicClient.multicall({
            contracts: calls,
            allowFailure: true
          });

          results.forEach((result, index) => {
            if (result.status === 'success') {
              tokenAddresses.push(result.result as string);
            }
          });
        }

        setRewardTokens(tokenAddresses);
        hasFetchedRewardTokensRef.current = true;
      } catch (err) {
        console.error('Error fetching reward tokens:', err);
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
        // Reset fetch tracking on error to allow retry
        hasFetchedRewardTokensRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewardTokens();
  }, [bribesMap, publicClient, chain]);

  // Reset tracking when key dependencies change
  useEffect(() => {
    hasFetchedIncentivesRef.current = false;
    hasFetchedRewardTokensRef.current = false;
  }, [chain, normalizedMarketAddresses.length]);

  // Fetch incentives for markets once we have the bribe addresses and reward tokens
  useEffect(() => {
    // Skip if already fetched with these params
    if (hasFetchedIncentivesRef.current) return;

    const fetchIncentives = async () => {
      if (
        !publicClient ||
        !normalizedMarketAddresses.length ||
        !rewardTokens.length ||
        Object.keys(bribesMap).length === 0
      ) {
        return;
      }

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
          if (!bribesMap[market]) continue;

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
          if (!bribesMap[market]) continue;

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

  return {
    incentivesData,
    bribesMap,
    rewardTokens,
    getMarketIncentives,
    getBribeAddress,
    isLoading: isLoading || isBribesLoading,
    error
  };
};
