import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useIsComptrollerAdmin = (
  comptrollerAddress?: Address,
  poolChainId?: number
) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['isComptrollerAdmin', comptrollerAddress, sdk?.chainId],

    queryFn: async () => {
      if (!comptrollerAddress || !sdk) return null;

      try {
        const comptroller = sdk.createComptroller(comptrollerAddress);

        return address === (await comptroller.read.admin());
      } catch (e) {
        console.warn(
          `Checking comptroller admin error: `,
          { comptrollerAddress, poolChainId },
          e
        );

        return null;
      }
    },

    enabled: !!comptrollerAddress && !!sdk
  });
};
