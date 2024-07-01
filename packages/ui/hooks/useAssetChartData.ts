import { useQuery } from '@tanstack/react-query';
import { Address, parseEther } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { convertIRMtoCurve } from '@ui/utils/convertIRMtoCurve';

export function useAssetChartData(
  interestRateModelAddress: Address,
  reserveFactor: number,
  adminFee: number,
  poolChainId: number
) {
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: [
      'useAssetChartData',
      interestRateModelAddress,
      adminFee,
      reserveFactor,
      sdk?.chainId
    ],

    queryFn: async () => {
      if (sdk) {
        const interestRateModel = await sdk
          .identifyInterestRateModel(interestRateModelAddress)
          .catch((e) => {
            console.warn(
              `Identifying interest rate model error: `,
              {
                adminFee,
                interestRateModelAddress,
                poolChainId,
                reserveFactor
              },
              e
            );

            return null;
          });

        if (interestRateModel === null) {
          return null;
        }

        await interestRateModel._init(
          interestRateModelAddress,
          // reserve factor
          // reserveFactor * 1e16,
          parseEther((reserveFactor / 100).toString()),

          // admin fee
          // adminFee * 1e16,
          parseEther((adminFee / 100).toString()),

          // hardcoded 10% Fuse fee
          parseEther((10 / 100).toString()),
          sdk.publicClient
        );

        return convertIRMtoCurve(sdk, interestRateModel, sdk.chainId);
      } else {
        return null;
      }
    },

    gcTime: Infinity,

    enabled:
      !!interestRateModelAddress &&
      !!adminFee.toString() &&
      !!reserveFactor.toString() &&
      !!sdk &&
      !!poolChainId,

    staleTime: Infinity
  });
}
