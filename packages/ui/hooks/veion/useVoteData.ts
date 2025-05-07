import { useEffect, useState, useCallback, useMemo } from 'react';

import { usePublicClient } from 'wagmi';

import { LiskLPPoolContract } from '@ui/constants/liskLp';
import { getiVoterContract } from '@ui/constants/veIon';
import { MarketSide } from '@ui/types/veION';

import { VOTER_LENS_ADDRESSES } from './useMarketIncentives';

import { voterLensAbi } from '@ionicprotocol/sdk';

const extendedVoterLensAbi = [
  ...voterLensAbi,
  {
    type: 'function',
    name: 'getAllMarketVotes',
    inputs: [{ name: 'lp', type: 'address' }],
    outputs: [
      {
        name: '_marketVoteInfo',
        type: 'tuple[]',
        components: [
          { name: 'market', type: 'address' },
          { name: 'side', type: 'uint8' },
          { name: 'weight', type: 'uint256' },
          { name: 'votesValueInEth', type: 'uint256' }
        ]
      }
    ],
    stateMutability: 'view'
  }
] as const;

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

interface MarketVoteInfo {
  market: `0x${string}`;
  side: number;
  weight: bigint;
  votesValueInEth: bigint;
}

// Chain-specific LP token addresses
const LP_TOKEN_ADDRESSES = {
  8453: '0x0FAc819628a7F612AbAc1CaD939768058cc0170c', // Base
  34443: '0x690A74d2eC0175a69C0962B309E03021C0b5002E', // Mode
  1135: LiskLPPoolContract
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

  const voterContract = useMemo(() => {
    const contract = getiVoterContract(chain);
    return contract;
  }, [chain]);

  const lpTokenAddress = useMemo(() => {
    const address =
      LP_TOKEN_ADDRESSES[chain as keyof typeof LP_TOKEN_ADDRESSES] ||
      ('0x0000000000000000000000000000000000000000' as `0x${string}`);
    return address;
  }, [chain]);

  const voterLensAddress = useMemo(() => {
    const address =
      VOTER_LENS_ADDRESSES[chain as keyof typeof VOTER_LENS_ADDRESSES] ||
      ('0x0000000000000000000000000000000000000000' as `0x${string}`);
    return address;
  }, [chain]);

  const formatValue = (value: bigint): number =>
    Number((value * BASIS_POINTS) / DECIMALS_SCALAR);

  const fetchVoteData = useCallback(async () => {
    if (!voterContract || !publicClient || !marketAddresses.length) {
      setVoteData({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const marketKeys = marketAddresses.map(
        (addr, i) =>
          `${addr.toLowerCase()}-${marketSides[i] === MarketSide.Supply ? 'supply' : 'borrow'}`
      );

      let totalSystemWeight = 0n;
      const marketData: Record<
        string,
        { totalWeight: bigint; userVotes: bigint }
      > = {};

      marketKeys.forEach((key) => {
        marketData[key] = {
          totalWeight: 0n,
          userVotes: 0n
        };
      });

      if (voterLensAddress) {
        try {
          const allMarketVotes = (await publicClient.readContract({
            address: voterLensAddress,
            abi: extendedVoterLensAbi,
            functionName: 'getAllMarketVotes',
            args: [lpTokenAddress]
          })) as MarketVoteInfo[];

          if (allMarketVotes) {
            for (const marketVote of allMarketVotes) {
              const marketAddress = marketVote.market.toLowerCase();
              const marketSide = marketVote.side === 0 ? 'supply' : 'borrow';
              const key = `${marketAddress}-${marketSide}`;

              if (marketData[key]) {
                marketData[key].totalWeight = marketVote.weight;
                totalSystemWeight += marketVote.weight;
              }
            }
          }
        } catch (err) {
          console.error('Error fetching all market votes:', err);
        }
      }

      let totalUserWeight = 0n;

      if (tokenId) {
        try {
          const voteDetailsCall = {
            ...voterContract,
            functionName: 'getVoteDetails' as const,
            args: [BigInt(tokenId), lpTokenAddress] as const
          };

          const voteDetailsResult =
            await publicClient.readContract(voteDetailsCall);

          if (voteDetailsResult) {
            const voteDetails = voteDetailsResult as unknown as VoteDetails;

            if (voteDetails.marketVotes && voteDetails.votes) {
              voteDetails.marketVotes.forEach((marketAddress, index) => {
                const voteSide = voteDetails.marketVoteSides[index];
                const voteAmount = voteDetails.votes[index];

                const marketKey = `${marketAddress.toLowerCase()}-${voteSide === 0 ? 'supply' : 'borrow'}`;
                const matchingKey = Object.keys(marketData).find(
                  (key) => key.toLowerCase() === marketKey.toLowerCase()
                );

                if (matchingKey) {
                  marketData[matchingKey].userVotes = voteAmount;
                  totalUserWeight += voteAmount;
                }
              });
            }

            if (!totalUserWeight && voteDetails.usedWeight) {
              totalUserWeight = voteDetails.usedWeight;
            }
          }
        } catch (err) {
          console.error('Error fetching vote details:', err);
        }
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
  }, [tokenId, chain, marketAddresses, marketSides, voterLensAddress]);

  useEffect(() => {
    fetchVoteData();
  }, [fetchVoteData]);

  return {
    voteData,
    isLoading,
    error,
    refresh: fetchVoteData
  };
}
