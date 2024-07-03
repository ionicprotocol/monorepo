import { useQuery } from '@tanstack/react-query';

import type { PoolData } from '@ui/types/TokensDataMap';

export const useAllPoolsData = (allPools: PoolData[]) => {
  const response = useQuery({
    queryKey: ['useAllPoolsData', allPools.map((pool) => pool.comptroller)],

    queryFn: () => {
      return allPools.map((pool) => {
        return {
          assets: pool,
          borrowBalance: pool,
          chain: pool,
          poolName: pool,
          supplyBalance: pool,
          totalBorrow: pool,
          totalSupply: pool
        };
      });
    },

    enabled: allPools.length > 0
  });

  return response.data ?? [];
};
