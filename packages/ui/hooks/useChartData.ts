import { useQuery } from 'react-query';

import { useRari } from '../context/RariContext';
import { convertIRMtoCurve } from '../utils/convertIRMtoCurve';

export function useChartData(market: string) {
  const {
    midasSdk,
    currentChain: { id: currentChainId },
  } = useRari();
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
