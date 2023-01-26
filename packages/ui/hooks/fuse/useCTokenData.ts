import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useCTokenData = (
  comptrollerAddress?: string,
  cTokenAddress?: string,
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['CTokenData', cTokenAddress, comptrollerAddress, sdk?.chainId],
    async () => {
      if (comptrollerAddress && cTokenAddress && sdk) {
        const comptroller = sdk.createComptroller(comptrollerAddress);
        const cToken = sdk.createCTokenWithExtensions(cTokenAddress);
        const [
          adminFeeMantissa,
          reserveFactorMantissa,
          interestRateModelAddress,
          { collateralFactorMantissa },
          supplyCaps,
          borrowCaps,
        ] = await Promise.all([
          cToken.callStatic.adminFeeMantissa(),
          cToken.callStatic.reserveFactorMantissa(),
          cToken.callStatic.interestRateModel(),
          comptroller.callStatic.markets(cTokenAddress),
          comptroller.callStatic.supplyCaps(cTokenAddress),
          comptroller.callStatic.borrowCaps(cTokenAddress),
        ]);

        return {
          reserveFactorMantissa,
          adminFeeMantissa,
          collateralFactorMantissa,
          interestRateModelAddress,
          supplyCaps,
          borrowCaps,
        };
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!cTokenAddress && !!comptrollerAddress && !!sdk,
    }
  );
};
