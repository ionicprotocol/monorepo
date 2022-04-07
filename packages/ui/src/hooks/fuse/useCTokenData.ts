import { useQuery } from 'react-query';

import { useRari } from '@context/RariContext';
import { createComptroller, createCToken } from '@utils/createComptroller';

export interface CTokenData {
  reserveFactorMantissa: any;
  adminFeeMantissa: any;
  collateralFactorMantissa: any;
  interestRateModelAddress: string;
  cTokenAddress: string;
  isPaused: boolean;
}

export const useCTokenData = (comptrollerAddress?: string, cTokenAddress?: string) => {
  const { fuse } = useRari();

  const { data } = useQuery(['CTokenData', cTokenAddress], async () => {
    if (comptrollerAddress && cTokenAddress) {
      const comptroller = createComptroller(comptrollerAddress, fuse);
      const cToken = createCToken(fuse, cTokenAddress);

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
