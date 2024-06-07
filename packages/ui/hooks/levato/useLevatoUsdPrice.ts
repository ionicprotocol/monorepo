import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useLevatoUsdPrice = (underlying: string) => {
  const { levatoSdk } = useMultiIonic();

  return useQuery({
    enabled: !!levatoSdk,
    queryFn: async (): Promise<BigNumber> => {
      if (!levatoSdk) {
        throw new Error('Levato SDK not available!');
      }

      const levatoCreditDelegator = levatoSdk?.creditDelegatorContract;
      const price =
        await levatoCreditDelegator.callStatic.getAssetPrice(underlying);

      return price;
    },
    queryKey: ['levato', 'usdPrice', underlying]
  });
};
