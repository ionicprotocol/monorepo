import { useEffect, useState, useCallback, useMemo } from 'react';

import { usePublicClient } from 'wagmi';

import { getiVoterContract } from '@ui/constants/veIon';
import { MarketSide } from '@ui/types/veION';

import { useRewardTokens } from './useRewardTokens';

interface UseVoteDataParams {
  tokenId?: number;
  chain: number;
  marketAddresses: `0x${string}`[];
  marketSides: MarketSide[];
}

interface VoteData {
  totalVotes: { percentage: number; limit: number };
  myVotes: { percentage: number; value: number };
}

interface VoteDetails {
  marketVotes: readonly `0x${string}`[];
  marketVoteSides: number[];
  votes: readonly bigint[];
  usedWeight: bigint;
}

// Chain-specific LP token addresses
const LP_TOKEN_ADDRESSES = {
  8453: '0x0FAc819628a7F612AbAc1CaD939768058cc0170c', // Base
  34443: '0x690A74d2eC0175a69C0962B309E03021C0b5002E' // Mode
} as const;

const BASIS_POINTS = 10000n;
const DECIMALS_SCALAR = BigInt(10 ** 18);

export function useVoteData({
  tokenId,
  chain,
  marketAddresses,
  marketSides
}: UseVoteDataParams) {
  const publicClient = usePublicClient({ chainId: chain });
  const [voteData, setVoteData] = useState<Record<string, VoteData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use the reusable hook to fetch reward tokens
  const {
    rewardTokens,
    isLoading: isLoadingTokens,
    error: tokenError
  } = useRewardTokens(chain);

  const voterContract = useMemo(() => getiVoterContract(chain), [chain]);

  // Get LP token address for the current chain
  const lpTokenAddress = useMemo(() => {
    return (
      LP_TOKEN_ADDRESSES[chain as keyof typeof LP_TOKEN_ADDRESSES] ||
      ('0x0000000000000000000000000000000000000000' as `0x${string}`)
    );
  }, [chain]);

  const formatValue = (value: bigint): number =>
    Number((value * BASIS_POINTS) / DECIMALS_SCALAR);

  const fetchVoteData = useCallback(async () => {
    if (
      !voterContract ||
      !publicClient ||
      !marketAddresses.length ||
      !rewardTokens?.length ||
      isLoadingTokens
    ) {
      if (!isLoadingTokens) {
        setVoteData({});
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);

      // Initialize market data mapping with normalized lowercase addresses
      const marketKeys = marketAddresses.map(
        (addr, i) =>
          `${addr.toLowerCase()}-${marketSides[i] === MarketSide.Supply ? 'supply' : 'borrow'}`
      );

      // 1. Get weights for each market with all reward tokens
      let totalSystemWeight = 0n;
      const marketData: Record<
        string,
        { totalWeight: bigint; userVotes: bigint }
      > = {};

      // Initialize market data
      marketKeys.forEach((key) => {
        marketData[key] = {
          totalWeight: 0n,
          userVotes: 0n
        };
      });

      // Fetch total weights for each market and token
      for (const token of rewardTokens) {
        const weightCalls = marketAddresses.map((addr, i) => ({
          ...voterContract,
          functionName: 'weights',
          args: [addr, marketSides[i], token]
        }));

        const weights = await publicClient.multicall({
          contracts: weightCalls,
          allowFailure: true
        });

        weights.forEach((result, i) => {
          if (result.status === 'success') {
            const weight = result.result as bigint;
            marketData[marketKeys[i]].totalWeight += weight;
            totalSystemWeight += weight;
          }
        });
      }

      // 2. Get user votes if tokenId is provided (simplified approach)
      let totalUserWeight = 0n;

      if (tokenId) {
        try {
          // Get vote details using the LP token address for this chain in a single call
          const voteDetailsCall = {
            ...voterContract,
            functionName: 'getVoteDetails' as const,
            args: [BigInt(tokenId), lpTokenAddress] as const
          };

          // Execute the call to get vote details
          const voteDetailsResult =
            await publicClient.readContract(voteDetailsCall);

          if (voteDetailsResult) {
            const voteDetails = voteDetailsResult as unknown as VoteDetails;

            // Create a map of market addresses to their votes
            if (voteDetails.marketVotes && voteDetails.votes) {
              voteDetails.marketVotes.forEach((marketAddress, index) => {
                const voteSide = voteDetails.marketVoteSides[index];
                const voteAmount = voteDetails.votes[index];

                // Create a key in the same format as used elsewhere
                // Create a case-normalized key to ensure consistency with the marketKeys
                const marketKey = `${marketAddress.toLowerCase()}-${voteSide === 0 ? 'supply' : 'borrow'}`;

                // Find the matching key in marketData regardless of case
                const matchingKey = Object.keys(marketData).find(
                  (key) => key.toLowerCase() === marketKey.toLowerCase()
                );

                // Update the market data if the key exists
                if (matchingKey) {
                  marketData[matchingKey].userVotes = voteAmount;
                  totalUserWeight += voteAmount;
                }
              });
            }

            // Use the total used weight from the result
            if (!totalUserWeight && voteDetails.usedWeight) {
              totalUserWeight = voteDetails.usedWeight;
            }
          }
        } catch (err) {
          console.error('Error fetching vote details:', err);

          // Fallback to the original approach if the vote details call fails
          for (const token of rewardTokens) {
            const voteCalls = marketAddresses.map((addr, i) => ({
              ...voterContract,
              functionName: 'votes',
              args: [BigInt(tokenId), addr, marketSides[i], token]
            }));

            const voteResults = await publicClient.multicall({
              contracts: voteCalls,
              allowFailure: true
            });

            voteResults.forEach((result, i) => {
              if (result.status === 'success') {
                const vote = result.result as bigint;
                const key = marketKeys[i];
                marketData[key].userVotes += vote;
                totalUserWeight += vote;
              }
            });
          }
        }
      }

      // Format the data for the UI
      const newVoteData = Object.entries(marketData).reduce(
        (acc, [key, { totalWeight, userVotes }]) => {
          const totalWeightNumber = formatValue(totalWeight);
          const userVotesNumber = formatValue(userVotes);

          acc[key] = {
            totalVotes: {
              percentage:
                totalSystemWeight > 0n
                  ? (Number(totalWeight) / Number(totalSystemWeight)) * 100
                  : 0,
              limit: totalWeightNumber
            },
            myVotes: {
              value: userVotesNumber,
              percentage:
                totalUserWeight > 0n
                  ? (Number(userVotes) / Number(totalUserWeight)) * 100
                  : 0
            }
          };
          return acc;
        },
        {} as Record<string, VoteData>
      );

      setVoteData(newVoteData);
      setError(null);
    } catch (err) {
      console.error('Error fetching vote data:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to fetch vote data')
      );
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId, chain, marketAddresses, marketSides]);

  useEffect(() => {
    fetchVoteData();
  }, [fetchVoteData]);

  // Combine loading states
  const combinedIsLoading = isLoading || isLoadingTokens;

  // Combine errors
  const combinedError = error || tokenError;

  return {
    voteData,
    isLoading: combinedIsLoading,
    error: combinedError,
    refresh: fetchVoteData
  };
}
