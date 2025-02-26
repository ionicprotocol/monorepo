import { useEffect, useState, useCallback } from 'react';

import { usePublicClient } from 'wagmi';

import { getiVoterContract } from '@ui/constants/veIon';
import { MarketSide } from '@ui/types/veION';

import { REWARD_TOKENS } from '../rewards/useBribeRewards';

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

const BASIS_POINTS = 10000n;
const DECIMALS_SCALAR = BigInt(10 ** 18);
const MULTICALL_CHUNK_SIZE = 5;

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

  const voterContract = getiVoterContract(chain);
  const rewardTokens = REWARD_TOKENS[chain as keyof typeof REWARD_TOKENS];

  const formatValue = (value: bigint): number =>
    Number((value * BASIS_POINTS) / DECIMALS_SCALAR);

  const fetchVoteData = useCallback(async () => {
    if (
      !voterContract ||
      !publicClient ||
      !marketAddresses.length ||
      !rewardTokens?.length
    ) {
      setVoteData({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const chunks = chunkArray(
        marketAddresses.map((addr, i) => ({ addr, side: marketSides[i] })),
        MULTICALL_CHUNK_SIZE
      );

      const marketData: {
        [key: string]: { totalWeight: bigint; userVotes: bigint };
      } = {};
      let totalSystemWeight = 0n;
      let totalUserWeight = 0n;

      for (const chunk of chunks) {
        const weightCalls = chunk.flatMap(({ addr, side }) =>
          rewardTokens.map((token) => ({
            ...voterContract,
            functionName: 'weights',
            args: [addr, side, token]
          }))
        );

        const voteCalls = tokenId
          ? chunk.flatMap(({ addr, side }) =>
              rewardTokens.map((token) => ({
                ...voterContract,
                functionName: 'votes',
                args: [BigInt(tokenId), addr, side, token]
              }))
            )
          : [];

        const [weights, votes] = await Promise.all([
          publicClient.multicall({
            contracts: weightCalls,
            allowFailure: true
          }),
          tokenId
            ? publicClient.multicall({
                contracts: voteCalls,
                allowFailure: true
              })
            : Promise.resolve([])
        ]);

        chunk.forEach(({ addr, side }, chunkIdx) => {
          const start = chunkIdx * rewardTokens.length;
          const end = start + rewardTokens.length;

          const marketWeights = weights
            .slice(start, end)
            .map((w) => (w.status === 'success' ? w.result : 0n)) as bigint[];
          const marketTotalWeight = marketWeights.reduce(
            (sum, w) => sum + w,
            0n
          );

          const marketUserVotes = tokenId
            ? (
                votes
                  .slice(start, end)
                  .map((v) =>
                    v.status === 'success' ? v.result : 0n
                  ) as bigint[]
              ).reduce((sum, v) => sum + v, 0n)
            : 0n;

          const key = `${addr}-${side === MarketSide.Supply ? 'supply' : 'borrow'}`;
          marketData[key] = {
            totalWeight: marketTotalWeight,
            userVotes: marketUserVotes
          };

          totalSystemWeight += marketTotalWeight;
          totalUserWeight += marketUserVotes;
        });
      }

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

  return { voteData, isLoading, error, refresh: fetchVoteData };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
