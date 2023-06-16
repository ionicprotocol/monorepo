import type { SupportedChains } from '@midas-capital/types';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import type { AllRewardsPerChainStatus } from '@ui/types/ComponentPropsType';

export const useAllClaimableRewardsPerChain = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiMidas();

  const allRewardQueries = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        cacheTime: Infinity,
        enabled: !!chainId && !!address,
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && sdk && address) {
            return await sdk.getAllFlywheelClaimableRewards(address);
          } else {
            return null;
          }
        },
        queryKey: ['useAllClaimableRewardsPerChain', chainId, address],
        staleTime: Infinity,
      };
    }),
  });

  const [allRewardsPerChain, isRefetching, isLoading] = useMemo(() => {
    const _allRewardsPerChain: AllRewardsPerChainStatus = {};

    let isLoading = true;
    let isRefetching = true;

    allRewardQueries.map((reward, index) => {
      isLoading = isLoading && reward.isLoading;
      isRefetching = isRefetching && reward.isRefetching;
      const _chainId = chainIds[index];
      _allRewardsPerChain[_chainId.toString()] = reward.data;
    });

    return [_allRewardsPerChain, isRefetching, isLoading];
  }, [allRewardQueries, chainIds]);

  return { allRewardsPerChain, isLoading, isRefetching };
};
