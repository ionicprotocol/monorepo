import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

export const useIsUpgradeable = (comptrollerAddress: Address) => {
  const { currentSdk, currentChain } = useMultiIonic();

  const { data } = useQuery(
    [
      'useIsUpgradeable',
      currentChain?.id,
      comptrollerAddress,
      currentSdk?.chainId
    ],
    async () => {
      if (currentSdk) {
        try {
          const comptroller = currentSdk.createComptroller(comptrollerAddress);

          const isUpgradeable: boolean =
            await comptroller.read.adminHasRights();

          return isUpgradeable;
        } catch (e) {
          console.warn(
            `Checking upgradeable error: `,
            { comptrollerAddress },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!comptrollerAddress && !!currentChain && !!currentSdk,
      staleTime: Infinity
    }
  );

  return data;
};
