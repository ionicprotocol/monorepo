import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useIsUpgradeable = (comptrollerAddress: Address, poolChainId: number) => {
  const sdk = useSdk(poolChainId);

  const { data } = useQuery({
    queryKey: ['useIsUpgradeable', comptrollerAddress, sdk?.chainId],

    queryFn: async () => {
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

    gcTime: Infinity,
    enabled: !!comptrollerAddress && !!sdk,
    staleTime: Infinity
  });

  return data;
};
