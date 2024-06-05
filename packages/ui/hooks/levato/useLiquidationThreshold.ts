import { useQuery } from '@tanstack/react-query';
import { formatUnits, parseEther } from 'ethers/lib/utils';

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
    queryFn: async (): Promise<number | undefined> => {
      if (!levatoSdk) {
        throw new Error('Error while fetching liquidation threshold');
      }

      const liquidationThreshold = await levatoSdk.getLiquidationThreshold(
        collateralAsset,
        collateralAmount,
        borrowedAsset,
        leverageRatio
      );
      console.log(
        collateralAsset,
        collateralAmount,
        borrowedAsset,
        leverageRatio
      );
      const creditDelegatorUsdPrice =
        await levatoSdk.creditDelegatorContract.callStatic.getAssetPrice(
          '0xd988097fb8612cc24eeC14542bC03424c656005f'
        );

      return Number(
        formatUnits(
          liquidationThreshold
            ? liquidationThreshold
                ?.mul(parseEther('1'))
                .div(creditDelegatorUsdPrice)
            : '0',
          6
        )
      );
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
