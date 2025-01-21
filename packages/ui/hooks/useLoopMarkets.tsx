import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

import type { Address } from 'viem';

export type LoopMarketData = {
  [key: Address]: Address[];
};

export const useLoopMarkets = (
  collateralMarkets: Address[],
  chainId: number
) => {
  const { getSdk } = useMultiIonic();
  const currentSdk = getSdk(chainId);

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
