import { useEffect, useState, useCallback } from 'react';

import { usePublicClient } from 'wagmi';

import { getiVoterContract } from '@ui/constants/veIon';
import { MarketSide } from '@ui/types/veION';

interface UseVoteDataParams {
  tokenId?: number;
  chain: number;
  marketAddresses: `0x${string}`[];
  marketSides: MarketSide[];
}

interface VoteData {
  totalVotes: {
    percentage: number; // Pure number for sorting
    limit: number; // Pure number for sorting
  };
  myVotes: {
    percentage: number; // Pure number for sorting
    value: number; // Pure number for sorting
  };
}

const BASIS_POINTS = 10000n;
const TOKEN_DECIMALS = 18;
const DECIMALS_SCALAR = BigInt(10 ** TOKEN_DECIMALS);
const MULTICALL_CHUNK_SIZE = 2;

export function useVoteData({
  tokenId,
  chain,
  marketAddresses,
  marketSides
}: UseVoteDataParams) {
  const publicClient = usePublicClient({
    chainId: chain
  });
  const [voteData, setVoteData] = useState<Record<string, VoteData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const voterContract = getiVoterContract(chain);

  const formatValue = (value: bigint): number => {
    return Number((value * BASIS_POINTS) / DECIMALS_SCALAR);
  };

  const chunkArray = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
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

      const marketChunks = chunkArray(marketAddresses, MULTICALL_CHUNK_SIZE);
      const sideChunks = chunkArray(marketSides, MULTICALL_CHUNK_SIZE);

      const marketData: {
        [key: string]: { totalWeight: bigint; userVotes: bigint };
      } = {};
      let totalSystemWeight = 0n;
      let totalUserWeight = 0n;

      // Process each chunk of markets
      for (let i = 0; i < marketChunks.length; i++) {
        const marketsChunk = marketChunks[i];
        const sidesChunk = sideChunks[i];

        const weightCalls = marketsChunk.flatMap((market, index) =>
          lpTokens.map((lpToken) => ({
            ...voterContract,
            functionName: 'weights',
            args: [market, sidesChunk[index], lpToken]
          }))
        );

        const voteCalls = tokenId
          ? marketsChunk.flatMap((market, index) =>
              lpTokens.map((lpToken) => ({
                ...voterContract,
                functionName: 'votes',
                args: [BigInt(tokenId), market, sidesChunk[index], lpToken]
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

        // Process results for this chunk
        marketsChunk.forEach((market, marketIndex) => {
          const lpStart = marketIndex * lpTokens.length;
          const lpEnd = lpStart + lpTokens.length;

          const marketWeights = weights
            .slice(lpStart, lpEnd)
            .map((w) => (w.status === 'success' ? w.result : 0n) as bigint);
          const marketTotalWeight = marketWeights.reduce(
            (sum, w) => sum + w,
            0n
          );

          const marketUserVotes = tokenId
            ? votes
                .slice(lpStart, lpEnd)
                .map((v) => (v.status === 'success' ? v.result : 0n) as bigint)
                .reduce((sum, v) => sum + v, 0n)
            : 0n;

          const key = `${market}-${sidesChunk[marketIndex] === MarketSide.Supply ? 'supply' : 'borrow'}`;

          marketData[key] = {
            totalWeight: marketTotalWeight,
            userVotes: marketUserVotes
          };

          totalSystemWeight += marketTotalWeight;
          totalUserWeight += marketUserVotes;
        });
      }

      // Format final data with pure numbers
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
