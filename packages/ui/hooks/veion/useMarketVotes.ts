import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import { usePublicClient } from 'wagmi';

import { getiVoterContract } from '@ui/constants/veIon';
import { MarketSide } from '@ui/types/veION';

import { REWARD_TOKENS } from '../rewards/useBribeRewards';

export const useMarketVotes = (
  chain: number,
  marketAddresses: string[] = []
) => {
  const publicClient = usePublicClient({ chainId: chain });
  const [votesData, setVotesData] = useState<
    Record<string, { supply: number; borrow: number }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to track if we should fetch data
  const hasFetchedRef = useRef(false);

  // Get voter contract for the chain - memoized to prevent recreating
  const voterContract = useMemo(() => getiVoterContract(chain), [chain]);

  // Get reward tokens for the chain - memoized to prevent recreating
  const rewardTokens = useMemo(
    () => REWARD_TOKENS[chain as keyof typeof REWARD_TOKENS] || [],
    [chain]
  );

  // Prepare normalized market addresses for consistency - memoized to prevent recreating
  const normalizedMarketAddresses = useMemo(() => {
    if (!marketAddresses.length) return [];
    return marketAddresses.map((addr) => addr.toLowerCase());
  }, [marketAddresses]);

  // Helper to get votes for a specific market and side with percentage and limit structure
  const getMarketVotes = useCallback(
    (
      marketAddress: string,
      side: 'borrow' | 'supply'
    ): {
      percentage: number;
      limit: number;
      value?: number;
    } => {
      const normalizedAddress = marketAddress.toLowerCase();
      const votes = votesData[normalizedAddress]?.[side] || 0;

      return {
        percentage: votes > 0 ? 100 : 0, // Similar to voteData structure
        limit: votes,
        value: votes // Optional field with the actual vote value
      };
    },
    [votesData]
  );

  useEffect(() => {
    // Reset tracking of fetch when dependencies change
    hasFetchedRef.current = false;
  }, [chain, normalizedMarketAddresses.length, rewardTokens.length]);

  useEffect(() => {
    // Skip if already fetched with these params
    if (hasFetchedRef.current) return;

    const fetchVotes = async () => {
      if (
        !voterContract ||
        !publicClient ||
        !normalizedMarketAddresses.length ||
        !rewardTokens.length
      ) {
        setVotesData({});
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Mark as fetched at the beginning to prevent duplicate fetches
        hasFetchedRef.current = true;

        // Build calls for supply side
        const supplyCalls = normalizedMarketAddresses.flatMap((market) =>
          rewardTokens.map((token) => ({
            ...voterContract,
            functionName: 'weights',
            args: [market, MarketSide.Supply, token]
          }))
        );

        // Build calls for borrow side
        const borrowCalls = normalizedMarketAddresses.flatMap((market) =>
          rewardTokens.map((token) => ({
            ...voterContract,
            functionName: 'weights',
            args: [market, MarketSide.Borrow, token]
          }))
        );

        // Combine all calls and execute in one multicall
        const allCalls = [...supplyCalls, ...borrowCalls];
        const results = await publicClient.multicall({
          contracts: allCalls,
          allowFailure: true
        });

        // Process results
        const newVotesData: Record<string, { supply: number; borrow: number }> =
          {};

        // Process supply results
        normalizedMarketAddresses.forEach((market, marketIndex) => {
          // Calculate start index for this market in the results array
          const startIdx = marketIndex * rewardTokens.length;

          // Sum all token weights for this market's supply side
          const supplyTotal = results
            .slice(startIdx, startIdx + rewardTokens.length)
            .reduce((sum, result) => {
              if (result.status === 'success') {
                return sum + Number(result.result as bigint) / 1e18;
              }
              return sum;
            }, 0);

          // Initialize market data if not exists
          if (!newVotesData[market]) {
            newVotesData[market] = { supply: 0, borrow: 0 };
          }

          newVotesData[market].supply = supplyTotal;
        });

        // Process borrow results
        normalizedMarketAddresses.forEach((market, marketIndex) => {
          // Calculate start index for this market in the borrow results section
          const startIdx =
            supplyCalls.length + marketIndex * rewardTokens.length;

          // Sum all token weights for this market's borrow side
          const borrowTotal = results
            .slice(startIdx, startIdx + rewardTokens.length)
            .reduce((sum, result) => {
              if (result.status === 'success') {
                return sum + Number(result.result as bigint) / 1e18;
              }
              return sum;
            }, 0);

          // Initialize market data if not exists (should already exist from supply processing)
          if (!newVotesData[market]) {
            newVotesData[market] = { supply: 0, borrow: 0 };
          }

          newVotesData[market].borrow = borrowTotal;
        });

        setVotesData(newVotesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching votes data:', err);
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
        // Reset fetch tracking on error to allow retry
        hasFetchedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchVotes();
  }, [normalizedMarketAddresses, rewardTokens, publicClient, voterContract]);

  // Format data like voteData with key format: ${marketAddress}-${side}
  const formattedVoteData = useMemo(() => {
    const result: Record<
      string,
      { totalVotes: { percentage: number; limit: number } }
    > = {};

    Object.entries(votesData).forEach(([marketAddress, data]) => {
      // Format for supply side
      const supplyKey = `${marketAddress}-supply`;
      result[supplyKey] = {
        totalVotes: {
          percentage: data.supply > 0 ? 100 : 0,
          limit: data.supply
        }
      };

      // Format for borrow side
      const borrowKey = `${marketAddress}-borrow`;
      result[borrowKey] = {
        totalVotes: {
          percentage: data.borrow > 0 ? 100 : 0,
          limit: data.borrow
        }
      };
    });

    return result;
  }, [votesData]);

  return {
    votesData: formattedVoteData, // Formatted like useVoteData
    getMarketVotes,
    isLoading,
    error
  };
};
