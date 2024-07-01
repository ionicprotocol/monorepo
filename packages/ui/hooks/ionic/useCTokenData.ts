import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useCTokenData = (
  comptrollerAddress?: Address,
  cTokenAddress?: Address,
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useCTokenData', cTokenAddress, comptrollerAddress, sdk?.chainId],
    async () => {
      if (comptrollerAddress && cTokenAddress && sdk) {
        try {
          const comptroller = sdk.createComptroller(comptrollerAddress);
          const cToken = sdk.createICErc20(cTokenAddress);
          const [
            adminFeeMantissa,
            reserveFactorMantissa,
            interestRateModelAddress,
            decimals,
            [, collateralFactorMantissa],
            supplyCap,
            borrowCap
          ] = await Promise.all([
            cToken.read.adminFeeMantissa(),
            cToken.read.reserveFactorMantissa(),
            cToken.read.interestRateModel(),
            cToken.read.decimals(),
            comptroller.read.markets([cTokenAddress]),
            comptroller.read.supplyCaps([cTokenAddress]),
            comptroller.read.borrowCaps([cTokenAddress])
          ]);

          return {
            adminFeeMantissa,
            borrowCap,
            collateralFactorMantissa,
            decimals,
            interestRateModelAddress,
            reserveFactorMantissa,
            supplyCap
          };
        } catch (e) {
          console.warn(
            `Getting cToken data error: `,
            { cTokenAddress, comptrollerAddress, poolChainId },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },
    {
      enabled: !!cTokenAddress && !!comptrollerAddress && !!sdk
    }
  );
};
