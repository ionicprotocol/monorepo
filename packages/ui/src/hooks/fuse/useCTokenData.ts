import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';
import { createComptroller, createCToken } from '@ui/utils/createComptroller';

export const useCTokenData = (comptrollerAddress?: string, cTokenAddress?: string) => {
  const { fuse } = useRari();

  const { data } = useQuery(['CTokenData', cTokenAddress], async () => {
    if (comptrollerAddress && cTokenAddress) {
      const comptroller = createComptroller(comptrollerAddress, fuse);
      const cToken = createCToken(cTokenAddress, fuse);

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
      return null;
    }
  });

  return data;
};
