import { useQuery } from '@tanstack/react-query';

import { useCrossFusePools } from '@ui/hooks/fuse/useCrossFusePools';
import { useEnabledChains } from '@ui/hooks/useChainConfig';

export const useFusePoolData = (poolId: string, poolChainId: number) => {
  const enabledChains = useEnabledChains();
  const { poolsPerChain } = useCrossFusePools([...enabledChains]);

  return useQuery(
    ['useFusePoolData', poolId, poolChainId, poolsPerChain[poolChainId.toString()]],
    () => {
      if (poolsPerChain[poolChainId.toString()] && poolsPerChain[poolChainId.toString()].data) {
        const pool = poolsPerChain[poolChainId.toString()].data?.find(
          (pool) => pool.id.toString() === poolId
        );

        return pool ? pool : null;
      }

      return null;
    },
    {
      cacheTime: Infinity,
      enabled:
        !!poolId &&
        !!poolChainId &&
        !!poolsPerChain[poolChainId.toString()] &&
        !poolsPerChain[poolChainId.toString()].isLoading,
      staleTime: Infinity,
    }
  );
};
