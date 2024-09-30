import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { convertIRMtoCurve } from '@ui/utils/convertIRMtoCurve';

export function useChartData(market: Address, poolChainId: number) {
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['useChartData', market, sdk?.chainId],

    queryFn: async () => {
      if (sdk) {
        const interestRateModel = await sdk
          .getInterestRateModel(market)
          .catch((e) => {
            console.warn(
              `Getting intereste rate modal error: `,
              { market, poolChainId },
              e
            );

            return null;
          });

        if (interestRateModel === null) {
          return { rates: null };
        }

        return convertIRMtoCurve(sdk, interestRateModel, sdk.chainId);
      } else {
        return null;
      }
    },

    enabled: !!sdk && !!market,
    staleTime: Infinity
  });
}
