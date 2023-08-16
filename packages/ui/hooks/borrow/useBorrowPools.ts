import { useQuery } from '@tanstack/react-query';

import type { PoolData } from '@ui/types/TokensDataMap';

export const useBorrowPools = (allPools: PoolData[]) => {
  const response = useQuery(
    ['useBorrowPools', allPools.map((pool) => pool.comptroller)],
    () => {
      return allPools.map((pool) => {
        return {
          assets: pool,
          available: pool,
          borrowBalance: pool,
          network: pool,
          poolName: pool,
          totalBorrow: pool
        };
      });
    },
    {
      enabled: allPools.length > 0
    }
  );

  return response.data ?? [];
};
