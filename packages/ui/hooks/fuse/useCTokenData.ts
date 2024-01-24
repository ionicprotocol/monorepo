import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useCTokenData = (
  comptrollerAddress?: string,
  cTokenAddress?: string,
  poolChainId?: number
) => {
  // const sdk = useSdk(poolChainId);
  // return useQuery(
  //   ['useCTokenData', cTokenAddress, comptrollerAddress, sdk?.chainId],
  //   async () => {
  //     if (comptrollerAddress && cTokenAddress && sdk) {
  //       try {
  //         const comptroller = sdk.createComptroller(comptrollerAddress);
  //         const cToken = sdk.createCTokenWithExtensions(cTokenAddress);
  //         const [
  //           adminFeeMantissa,
  //           reserveFactorMantissa,
  //           interestRateModelAddress,
  //           decimals,
  //           { collateralFactorMantissa },
  //           supplyCap,
  //           borrowCap
  //         ] = await Promise.all([
  //           cToken.callStatic.adminFeeMantissa(),
  //           cToken.callStatic.reserveFactorMantissa(),
  //           cToken.callStatic.interestRateModel(),
  //           cToken.callStatic.decimals(),
  //           comptroller.callStatic.markets(cTokenAddress),
  //           comptroller.callStatic.supplyCaps(cTokenAddress),
  //           comptroller.callStatic.borrowCaps(cTokenAddress)
  //         ]);
  //         return {
  //           adminFeeMantissa,
  //           borrowCap,
  //           collateralFactorMantissa,
  //           decimals,
  //           interestRateModelAddress,
  //           reserveFactorMantissa,
  //           supplyCap
  //         };
  //       } catch (e) {
  //         console.warn(
  //           `Getting cToken data error: `,
  //           { cTokenAddress, comptrollerAddress, poolChainId },
  //           e
  //         );
  //         return null;
  //       }
  //     } else {
  //       return null;
  //     }
  //   },
  //   {
  //     cacheTime: Infinity,
  //     enabled: !!cTokenAddress && !!comptrollerAddress && !!sdk,
  //     staleTime: Infinity
  //   }
  // );
};
