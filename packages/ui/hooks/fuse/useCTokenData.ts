import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const useCTokenData = (comptrollerAddress?: string, cTokenAddress?: string) => {
  const { fuse } = useRari();

  const { data } = useQuery(
    ['CTokenData', cTokenAddress, comptrollerAddress],
    async () => {
      if (comptrollerAddress && cTokenAddress) {
        const comptroller = fuse.createComptroller(comptrollerAddress);
        const cToken = fuse.createCToken(cTokenAddress);

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
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!cTokenAddress && !!comptrollerAddress }
  );

  return data;
};
