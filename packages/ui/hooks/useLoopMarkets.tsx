import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export type LoopMarketData = {
  [key: Address]: Address[];
};

export const useLoopMarkets = (collateralMarkets: Address[]) => {
  const { currentSdk } = useMultiIonic();

  return useQuery({
    queryFn: async (): Promise<LoopMarketData> => {
      if (!currentSdk) {
        throw new Error('SDK not intialized!');
      }

      const factory = currentSdk?.createLeveredPositionFactory();
      const markets = await Promise.all(
        collateralMarkets.map((collateralMarket) =>
          factory.read.getBorrowableMarketsByCollateral([collateralMarket])
        )
      );
      const data: LoopMarketData = {};

      collateralMarkets.forEach(
        (collateralMarket, i) =>
          (data[collateralMarket] = markets[i] as Address[])
      );

      return data;
    },
    queryKey: ['markets', 'borrowable', ...collateralMarkets]
  });
};
