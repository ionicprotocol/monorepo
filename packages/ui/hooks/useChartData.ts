import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { convertIRMtoCurve } from '@ui/utils/convertIRMtoCurve';

export function useChartData(market: string, poolChainId: number) {
  const { data: sdk } = useSdk(poolChainId);

  return useQuery(
    ['useChartData', market, sdk?.chainId],
    async () => {
      if (sdk) {
        const interestRateModel = await sdk.getInterestRateModel(market);

        if (interestRateModel === null) {
          return { borrowerRates: null, supplierRates: null };
        }

        return convertIRMtoCurve(sdk, interestRateModel, sdk.chainId);
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!sdk && !!market,
    }
  );
}
