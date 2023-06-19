import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useFlywheelEnabledMarkets = (flywheelAddress: string) => {
  const { currentSdk } = useMultiMidas();

  return useQuery(
    ['useFlywheelEnabledMarkets', flywheelAddress, currentSdk?.chainId],
    async () => {
      if (flywheelAddress && currentSdk) {
        return await currentSdk.getFlywheelEnabledMarkets(flywheelAddress).catch((e) => {
          console.warn(`Getting flywheel enabled markets error: `, { flywheelAddress }, e);

          return null;
        });
      }

      return null;
    },
    {
      cacheTime: Infinity,
      enabled: !!flywheelAddress && !!currentSdk,
      staleTime: Infinity,
    }
  );
};
