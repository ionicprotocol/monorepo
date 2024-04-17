import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useLiquidationThreshold = (
  collateralAsset: string,
  collateralAmount: string,
  borrowedAsset: string,
  leverageRatio: string
) => {
  const { levatoSdk } = useMultiIonic();

  return useQuery({
    enabled: !!levatoSdk,
    queryFn: async (): Promise<BigNumber | undefined> => {
      if (!levatoSdk) {
        throw new Error('Error while fetching liquidation threshold');
      }

      const liquidationThreshold = await levatoSdk.getLiquidationThreshold(
        collateralAsset,
        collateralAmount,
        borrowedAsset,
        leverageRatio
      );

      return liquidationThreshold;
    },
    queryKey: [
      'levato',
      'liquidation',
      collateralAsset,
      collateralAmount,
      borrowedAsset,
      leverageRatio
    ]
  });
};
