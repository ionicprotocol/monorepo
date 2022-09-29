import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { convertIRMtoCurve } from '@ui/utils/convertIRMtoCurve';

export function useChartData(market: string) {
  const { currentSdk, currentChain } = useMultiMidas();

  return useQuery(
    ['useChartData', currentChain?.id, market, currentSdk?.chainId],
    async () => {
      if (currentSdk && currentChain) {
        const interestRateModel = await currentSdk.getInterestRateModel(market);

        if (interestRateModel === null) {
          return { borrowerRates: null, supplierRates: null };
        }

        return convertIRMtoCurve(currentSdk, interestRateModel, currentChain.id);
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!currentSdk && !!currentChain && !!market,
    }
  );
}
