import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useFlywheelEnabledMarkets = (flywheelAddress: string) => {
  const { currentSdk } = useMultiMidas();

  return useQuery(
    ['useFlywheelEnabledMarkets', flywheelAddress, currentSdk?.chainId],
    async () => {
      if (flywheelAddress && currentSdk) {
        return currentSdk.getFlywheelEnabledMarkets(flywheelAddress);
      }

      return null;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!flywheelAddress && !!currentSdk,
    }
  );
};
