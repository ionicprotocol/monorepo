import { useQuery } from 'react-query';

import { useRari } from '../context/RariContext';
import { convertIRMtoCurve } from '../utils/convertIRMtoCurve';

export function useChartData(market: string) {
  const {
    fuse,
    currentChain: { id: currentChainId },
  } = useRari();
  return useQuery(
    ['useChartData', currentChainId, market],
    async () => {
      const interestRateModel = await fuse.getInterestRateModel(market);

      if (interestRateModel === null) {
        return { borrowerRates: null, supplierRates: null };
      }

      return convertIRMtoCurve(fuse, interestRateModel, currentChainId);
    },
    {
      enabled: !!fuse && !!currentChainId && !!market,
    }
  );
}
