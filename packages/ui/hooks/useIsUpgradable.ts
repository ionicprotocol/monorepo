import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const { currentSdk, currentChain } = useMultiMidas();

  const { data } = useQuery(
    ['useIsUpgradeable', currentChain?.id, comptrollerAddress, currentSdk?.chainId],
    async () => {
      if (currentSdk) {
        try {
          const comptroller = currentSdk.createComptroller(comptrollerAddress);

          const isUpgradeable: boolean = await comptroller.callStatic.adminHasRights();

          return isUpgradeable;
        } catch (e) {
          console.warn(`Checking upgradeable error: `, { comptrollerAddress }, e);

          return null;
        }
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!comptrollerAddress && !!currentChain && !!currentSdk,
      staleTime: Infinity,
    }
  );

  return data;
};
