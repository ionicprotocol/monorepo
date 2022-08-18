import { useQuery } from 'react-query';

import { useMidas } from '@ui/context/MidasContext';
import { convertIRMtoCurve } from '@ui/utils/convertIRMtoCurve';

export function useChartData(market: string) {
  const {
    midasSdk,
    currentChain: { id: currentChainId },
  } = useMidas();
  return useQuery(
    ['useChartData', currentChainId, market],
    async () => {
      const interestRateModel = await midasSdk.getInterestRateModel(market);

      if (interestRateModel === null) {
        return { borrowerRates: null, supplierRates: null };
      }

      return convertIRMtoCurve(midasSdk, interestRateModel, currentChainId);
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!midasSdk && !!currentChainId && !!market,
    }
  );
}
