import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useMaxLeverageAmount = (
  collateralUnderlying: string,
  collateralAmount: string,
  borrowAssetUnderlying: string
) => {
  const { address, levatoSdk } = useMultiIonic();

  return useQuery({
    enabled: !!address && !!levatoSdk,
    queryFn: async (): Promise<BigNumber> => {
      if (!address || !levatoSdk) {
        throw new Error('Unable to fetch max leverage amount');
      }

      const maxLeverageAmount = await levatoSdk.getMaxLeverageRatio(
        collateralUnderlying,
        collateralAmount,
        borrowAssetUnderlying
      );

      return maxLeverageAmount;
    },
    queryKey: [
      'levato',
      'leverage',
      collateralUnderlying,
      collateralAmount,
      borrowAssetUnderlying
    ]
  });
};
