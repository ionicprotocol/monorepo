import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useRewardsInfoForMarket = (
  flywheelAddress?: string,
  marketAddress?: string,
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useRewardsInfoForMarket', flywheelAddress, marketAddress, sdk?.chainId],
    async () => {
      if (flywheelAddress && marketAddress && sdk) {
        return sdk.getFlywheelRewardsInfoForMarket(flywheelAddress, marketAddress);
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!flywheelAddress && !!marketAddress && !!sdk,
    }
  );
};
