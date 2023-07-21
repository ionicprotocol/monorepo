import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const { currentSdk, currentChain } = useMultiIonic();

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
      enabled: !!comptrollerAddress && !!currentChain && !!currentSdk
    }
  );

  return data;
};
