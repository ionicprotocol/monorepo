import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useCTokenData = (comptrollerAddress?: string, cTokenAddress?: string) => {
  const { currentSdk } = useMultiMidas();

  const { data } = useQuery(
    ['CTokenData', cTokenAddress, comptrollerAddress, currentSdk?.chainId],
    async () => {
      if (comptrollerAddress && cTokenAddress && currentSdk) {
        const comptroller = currentSdk.createComptroller(comptrollerAddress);
        const cToken = currentSdk.createCToken(cTokenAddress);

        const [
          adminFeeMantissa,
          reserveFactorMantissa,
          interestRateModelAddress,
          { collateralFactorMantissa },
        ] = await Promise.all([
          cToken.callStatic.adminFeeMantissa(),
          cToken.callStatic.reserveFactorMantissa(),
          cToken.callStatic.interestRateModel(),
          comptroller.callStatic.markets(cTokenAddress),
        ]);

        return {
          reserveFactorMantissa,
          adminFeeMantissa,
          collateralFactorMantissa,
          interestRateModelAddress,
        };
      } else {
        return undefined;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!cTokenAddress && !!comptrollerAddress && !!currentSdk,
    }
  );

  return data;
};
