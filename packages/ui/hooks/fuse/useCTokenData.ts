import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { getComptrollerContract, getCTokenContract } from '@ui/utils/contracts';

export const useCTokenData = (
  comptrollerAddress?: string,
  cTokenAddress?: string,
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  const { data } = useQuery(
    ['CTokenData', cTokenAddress, comptrollerAddress, sdk?.chainId],
    async () => {
      if (comptrollerAddress && cTokenAddress && sdk) {
        const comptroller = getComptrollerContract(comptrollerAddress, sdk);
        const cToken = getCTokenContract(cTokenAddress, sdk);
        const [
          adminFeeMantissa,
          reserveFactorMantissa,
          interestRateModelAddress,
          { collateralFactorMantissa },
          supplyCaps,
        ] = await Promise.all([
          cToken.callStatic.adminFeeMantissa(),
          cToken.callStatic.reserveFactorMantissa(),
          cToken.callStatic.interestRateModel(),
          comptroller.callStatic.markets(cTokenAddress),
          comptroller.callStatic.supplyCaps(cTokenAddress),
        ]);

        return {
          reserveFactorMantissa,
          adminFeeMantissa,
          collateralFactorMantissa,
          interestRateModelAddress,
          supplyCaps,
        };
      } else {
        return undefined;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!cTokenAddress && !!comptrollerAddress && !!sdk,
    }
  );

  return data;
};
