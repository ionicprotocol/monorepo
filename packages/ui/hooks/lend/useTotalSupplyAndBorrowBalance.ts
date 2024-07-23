import { useQuery } from '@tanstack/react-query';

import { useCrossPools } from '@ui/hooks/ionic/useCrossPools';
import { useEnabledChains } from '@ui/hooks/useChainConfig';

export const useTotalSupplyAndBorrowBalance = () => {
  const enabledChains = useEnabledChains();
  const { allPools } = useCrossPools([
    ...enabledChains.map((chain) => chain.id)
  ]);

  return useQuery({
    queryKey: [
      'useTotalSupplyAndBorrowBalance',
      allPools
        ?.map(
          (pool) =>
            pool.comptroller +
            pool.totalSupplyBalanceFiat +
            pool.totalBorrowBalanceFiat
        )
        .sort()
    ],

    queryFn: () => {
      if (allPools && allPools.length > 0) {
        const totalSupplyBalance = allPools.reduce(
          (res, pool) => res + pool.totalSupplyBalanceFiat,
          0
        );
        const totalBorrowBalance = allPools.reduce(
          (res, pool) => res + pool.totalBorrowBalanceFiat,
          0
        );

        return { totalBorrowBalance, totalSupplyBalance };
      }

      return null;
    },

    enabled: !!allPools && allPools.length > 0
  });
};
