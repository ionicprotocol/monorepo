import { useQuery } from '@tanstack/react-query';

import type { PoolsPerChainStatus } from '@ui/types/ComponentPropsType';

export const useLoadingStatusPerChain = (poolsPerChain: PoolsPerChainStatus) => {
  const response = useQuery(
    ['poolsLoadingStatusPerChain', Object.values(poolsPerChain).map((pools) => pools.isLoading)],
    () => {
      const _loadingStatusPerChain: { [chainId: string]: boolean } = {};

      Object.entries(poolsPerChain).map(([chainId, pools]) => {
        _loadingStatusPerChain[chainId] = pools.isLoading;
      });

      return _loadingStatusPerChain;
    },
    {
      enabled: Object.values(poolsPerChain).length > 0
    }
  );

  return response.data ?? {};
};
