import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useFlywheelEnabledMarkets = (flywheelAddress: Address) => {
  const { currentSdk } = useMultiIonic();

  return useQuery({
    queryKey: [
      'useFlywheelEnabledMarkets',
      flywheelAddress,
      currentSdk?.chainId
    ],

    queryFn: async () => {
      if (flywheelAddress && currentSdk) {
        return await currentSdk
          .getFlywheelEnabledMarkets(flywheelAddress)
          .catch((e) => {
            console.warn(
              `Getting flywheel enabled markets error: `,
              { flywheelAddress },
              e
            );

            return null;
          });
      }

      return null;
    },

    gcTime: Infinity,
    enabled: !!flywheelAddress && !!currentSdk,
    staleTime: Infinity
  });
};
