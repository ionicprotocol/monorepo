// hooks/useAllFusePoolData.ts
import { useState, useEffect } from 'react';

import { useFusePoolData } from './useFusePoolData';

interface Pool {
  id: string;
  chain: number;
}

interface PoolDataResult {
  data: unknown;
  isLoading: boolean;
}

const useAllFusePoolData = (
  pools: Pool[]
): { data: unknown[]; isLoading: boolean } => {
  const [data, setData] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const results: PoolDataResult[] = await Promise.all(
        // eslint-disable-next-line react-hooks/rules-of-hooks
        pools.map((pool) => useFusePoolData(pool.id, pool.chain))
      );

      setData(results.map((result) => result.data));
      setIsLoading(results.some((result) => result.isLoading));
    };

    fetchData();
  }, [pools]);

  return { data, isLoading };
};

export default useAllFusePoolData;
