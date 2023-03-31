import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { convertIRMtoCurve } from '@ui/utils/convertIRMtoCurve';

export function useVaultChartData(poolChainId: number) {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useVaultChartData', sdk?.chainId],
    async () => {
      if (sdk) {
        await interestRateModel._init(
          interestRateModelAddress,
          // reserve factor
          // reserveFactor * 1e16,
          utils.parseEther((reserveFactor / 100).toString()),

          // admin fee
          // adminFee * 1e16,
          utils.parseEther((adminFee / 100).toString()),

          // hardcoded 10% Fuse fee
          utils.parseEther((10 / 100).toString()),
          sdk.provider
        );

        return convertIRMtoCurve(sdk, interestRateModel, sdk.chainId);
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled:
        !!interestRateModelAddress &&
        !!adminFee.toString() &&
        !!reserveFactor.toString() &&
        !!sdk &&
        !!poolChainId,
      staleTime: Infinity,
    }
  );
}
