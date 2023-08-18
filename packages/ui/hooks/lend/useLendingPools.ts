import { useQuery } from '@tanstack/react-query';

import type { PoolData } from '@ui/types/TokensDataMap';

export const useLendingPools = (allPools: PoolData[]) => {
  const response = useQuery(
    ['useLendingPools', allPools.map((pool) => pool.comptroller)],
    () => {
      return allPools.map((pool) => {
        return {
          assets: pool,
          liquidity: pool,
          network: pool,
          poolName: pool,
          supplyBalance: pool,
          totalSupply: pool
        };
      });
    },
    {
      enabled: allPools.length > 0
    }
  );

  return response.data ?? [];
};
