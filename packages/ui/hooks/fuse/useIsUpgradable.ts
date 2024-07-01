import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useIsUpgradeable = (comptrollerAddress: Address, poolChainId: number) => {
  const sdk = useSdk(poolChainId);

  const { data } = useQuery(
    ['useIsUpgradeable', comptrollerAddress, sdk?.chainId],
    async () => {
      if (sdk) {
        try {
          const comptroller = sdk.createComptroller(comptrollerAddress);
          const isUpgradeable: boolean =
            await comptroller.read.adminHasRights();

          return isUpgradeable;
        } catch (e) {
          console.warn(
            `Checking upgradeable error: `,
            { comptrollerAddress, poolChainId },
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
      enabled: !!comptrollerAddress && !!sdk,
      staleTime: Infinity
    }
  );

  return data;
};
