import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useFlywheelEnabledMarkets = (flywheelAddress: Address) => {
  const { currentSdk } = useMultiIonic();

  return useQuery(
    ['useFlywheelEnabledMarkets', flywheelAddress, currentSdk?.chainId],
    async () => {
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
    {
      cacheTime: Infinity,
      enabled: !!flywheelAddress && !!currentSdk,
      staleTime: Infinity
    }
  );
};
