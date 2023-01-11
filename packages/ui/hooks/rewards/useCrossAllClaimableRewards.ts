import { SupportedChains } from '@midas-capital/types';
import { useQueries, useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { Err, RewardsPerChainProps } from '@ui/types/ComponentPropsType';

export const useCrossAllClaimableRewards = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiMidas();

  const rewardsQueries = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        queryKey: ['useCrossAllClaimableRewards', chainId, address],
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && sdk && address) {
            return sdk.getFlywheelClaimableRewards(address);
          } else {
            return null;
          }
        },
        cacheTime: Infinity,
        staleTime: Infinity,
        enabled: !!chainId && !!address,
      };
    }),
  });

  return useQuery(
    [rewardsQueries.map((rewards) => rewards.data), chainIds],
    () => {
      const rewardsPerChain: RewardsPerChainProps = {};

      rewardsQueries.map((rewards, index) => {
        const chainId = chainIds[index];
        rewardsPerChain[chainId.toString()] = {
          isLoading: rewards.isLoading,
          error: rewards.error as Err | undefined,
          data: rewards.data,
          refetch: rewards.refetch,
        };
      });

      return rewardsPerChain;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: chainIds.length > 0,
    }
  );
};
