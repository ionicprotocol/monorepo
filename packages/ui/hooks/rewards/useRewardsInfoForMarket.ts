import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

import type { Address } from 'viem';

export const useRewardsInfoForMarket = (
  flywheelAddress?: Address,
  marketAddress?: Address,
  poolChainId?: number
) => {
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: [
      'useRewardsInfoForMarket',
      flywheelAddress,
      marketAddress,
      sdk?.chainId
    ],

    queryFn: async () => {
      if (flywheelAddress && marketAddress && sdk) {
        return await sdk
          .getFlywheelRewardsInfoForMarket(flywheelAddress, marketAddress)
          .catch((e) => {
            console.warn(
              `Getting flywheel rewards info for market error: `,
              { flywheelAddress, marketAddress, poolChainId },
              e
            );

            return null;
          });
      } else {
        return null;
      }
    },

    enabled: !!flywheelAddress && !!marketAddress && !!sdk,
    staleTime: Infinity
  });
};
