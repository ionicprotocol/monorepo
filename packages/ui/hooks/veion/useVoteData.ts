import { useEffect, useState, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { getVoterContract } from '@ui/constants/veIon';
import { MarketSide } from '@ui/types/veION';

interface UseVoteDataParams {
  tokenId?: number;
  chain: number;
  marketAddresses: `0x${string}`[];
  marketSides: MarketSide[];
}

interface VoteData {
  totalVotes: {
    percentage: string;
    limit: string;
  };
  myVotes: {
    percentage: string;
    value: string;
  };
}

const PERCENTAGE_DECIMALS = 2;
const BASIS_POINTS = 10000n;
const TOKEN_DECIMALS = 18;
const DECIMALS_SCALAR = BigInt(10 ** TOKEN_DECIMALS);

export function useVoteData({
  tokenId,
  chain,
  marketAddresses,
  marketSides
}: UseVoteDataParams) {
  const publicClient = usePublicClient();
  const [voteData, setVoteData] = useState<Record<string, VoteData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const voterContract = getVoterContract(chain);

  const calculateTotalVotesPercentage = (value: bigint): string => {
    // Calculate total votes as percentage of total basis points (10000)
    const normalizedValue = (value * BASIS_POINTS) / DECIMALS_SCALAR;
    const percentage = Number(normalizedValue) / 100;
    return percentage.toFixed(PERCENTAGE_DECIMALS) + '%';
  };

  const calculateMyVotesPercentage = (
    myVotes: bigint,
    totalVotes: bigint
  ): string => {
    // If total votes is 0, return 0%
    if (totalVotes === 0n) return '0.00%';

    // Calculate my votes as percentage of total votes
    const percentage = (Number(myVotes) / Number(totalVotes)) * 100;
    return percentage.toFixed(PERCENTAGE_DECIMALS) + '%';
  };

  const formatValue = (value: bigint): string => {
    // Format the raw value normalized to basis points scale
    return ((value * BASIS_POINTS) / DECIMALS_SCALAR).toString();
  };

  const fetchVoteData = useCallback(async () => {
    if (!voterContract || !publicClient || !marketAddresses.length) {
      setVoteData({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const lpTokens = await publicClient.readContract({
        ...voterContract,
        functionName: 'getAllLpRewardTokens'
      });

      console.log('LP tokens:', lpTokens);

      const votePromises = marketAddresses.map(async (market, index) => {
        const side = marketSides[index];

        const totalWeightPromises = lpTokens.map((lpToken) =>
          publicClient.readContract({
            ...voterContract,
            functionName: 'weights',
            args: [market, side, lpToken]
          })
        );

        const weights = await Promise.all(totalWeightPromises);
        const totalWeight = weights.reduce((sum, w) => sum + w, BigInt(0));

        let userVotes = BigInt(0);
        if (tokenId) {
          const userVotePromises = lpTokens.map((lpToken) =>
            publicClient.readContract({
              ...voterContract,
              functionName: 'votes',
              args: [BigInt(tokenId), market, side, lpToken]
            })
          );
          const votes = await Promise.all(userVotePromises);
          userVotes = votes.reduce((sum, v) => sum + v, BigInt(0));
        }

        const formattedTotalWeight = formatValue(totalWeight);
        const formattedUserVotes = formatValue(userVotes);

        console.log('Vote results for market', market, {
          totalWeight: formattedTotalWeight,
          userVotes: formattedUserVotes,
          myVotesPercentage: calculateMyVotesPercentage(userVotes, totalWeight)
        });

        const key = `${market}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;

        return {
          key,
          data: {
            totalVotes: {
              percentage: calculateTotalVotesPercentage(totalWeight),
              limit: formattedTotalWeight
            },
            myVotes: {
              percentage: calculateMyVotesPercentage(userVotes, totalWeight),
              value: formattedUserVotes
            }
          }
        };
      });

      const results = await Promise.all(votePromises);
      const newVoteData = results.reduce(
        (acc, { key, data }) => {
          acc[key] = data;
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
  }, [tokenId, chain, marketAddresses, marketSides]);

  useEffect(() => {
    fetchVoteData();
  }, [fetchVoteData]);

  return { voteData, isLoading, error, refresh: fetchVoteData };
}
