import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export type LoopMarketData = {
  [key: string]: string[];
};

export const useLoopMarkets = (collateralMarkets: string[]) => {
  const { currentSdk } = useMultiIonic();

  return useQuery({
    queryFn: async (): Promise<LoopMarketData> => {
      if (!currentSdk) {
        throw new Error('SDK not intialized!');
      }

      const factory = currentSdk?.createLeveredPositionFactory();
      const markets = await Promise.all(
        collateralMarkets.map((collateralMarket) =>
          factory.callStatic.getBorrowableMarketsByCollateral(collateralMarket)
        )
      );
      const data: LoopMarketData = {};

      collateralMarkets.forEach(
        (collateralMarket, i) => (data[collateralMarket] = markets[i])
      );

      return data;
    },
    queryKey: ['markets', 'borrowable', ...collateralMarkets]
  });
};
