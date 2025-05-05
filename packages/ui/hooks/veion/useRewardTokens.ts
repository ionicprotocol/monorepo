import { useState, useEffect, useRef } from 'react';

import { usePublicClient } from 'wagmi';

import { VOTERLENS_CHAIN_ADDRESSES } from '../rewards/useBribeRewards';
import { incentivesViewerAbi } from '../veion/useMarketIncentives';

const INCENTIVES_VIEWER_ADDRESSES = VOTERLENS_CHAIN_ADDRESSES;

export const useRewardTokens = (chain: number) => {
  const publicClient = usePublicClient({ chainId: chain });
  const [rewardTokens, setRewardTokens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const hasFetchedTokensRef = useRef(false);

  const incentivesViewerAddress =
    INCENTIVES_VIEWER_ADDRESSES[
      chain as keyof typeof INCENTIVES_VIEWER_ADDRESSES
    ];

  useEffect(() => {
    if (hasFetchedTokensRef.current && chain) {
      hasFetchedTokensRef.current = false;
      setRewardTokens([]);
      setIsLoading(true);
      setError(null);
    }

    const fetchRewardTokens = async () => {
      if (
        !publicClient ||
        !incentivesViewerAddress ||
        hasFetchedTokensRef.current
      ) {
        return;
      }

      try {
        setIsLoading(true);

        hasFetchedTokensRef.current = true;

        const incentivesData = await publicClient.readContract({
          address: incentivesViewerAddress,
          abi: incentivesViewerAbi,
          functionName: 'getAllIncentivesForBribes'
        });

        const tokenSet = new Set<string>();

        if (Array.isArray(incentivesData)) {
          incentivesData.forEach((incentive: any) => {
            if (Array.isArray(incentive.rewardsSupply)) {
              incentive.rewardsSupply.forEach((token: string) => {
                tokenSet.add(token);
              });
            }

            if (Array.isArray(incentive.rewardsBorrow)) {
              incentive.rewardsBorrow.forEach((token: string) => {
                tokenSet.add(token);
              });
            }
          });
        }

        const uniqueTokens = Array.from(tokenSet);
        setRewardTokens(uniqueTokens);
        setError(null);
      } catch (err) {
        console.error('Error fetching reward tokens:', err);
        setError(
          err instanceof Error ? err : new Error('Unknown error occurred')
        );
        hasFetchedTokensRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewardTokens();
  }, [chain, publicClient, incentivesViewerAddress]);

  return {
    rewardTokens,
    isLoading,
    error
  };
};
