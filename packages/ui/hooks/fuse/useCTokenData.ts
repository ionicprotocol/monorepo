import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { getComptrollerContract, getCTokenContract } from '@ui/utils/contracts';

export const useCTokenData = (
  comptrollerAddress?: string,
  cTokenAddress?: string,
  poolChainId?: number
) => {
  const { data: sdk } = useSdk(poolChainId);

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
      enabled: !!cTokenAddress && !!comptrollerAddress && !!sdk,
    }
  );

  return data;
};
