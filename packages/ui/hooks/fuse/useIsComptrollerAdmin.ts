import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useIsComptrollerAdmin = (
  comptrollerAddress?: string,
  poolChainId?: number
): boolean => {
  const { address } = useMultiIonic();
  const sdk = useSdk(poolChainId);

  const { data } = useQuery({
    queryKey: ['isComptrollerAdmin', comptrollerAddress, sdk?.chainId],

    queryFn: async () => {
      if (!comptrollerAddress || !sdk) return null;

      try {
        const comptroller = sdk.createComptroller(comptrollerAddress);

        return await comptroller.callStatic.admin();
      } catch (e) {
        console.warn(
          `Checking comptroller admin error: `,
          { comptrollerAddress, poolChainId },
          e
        );

        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!comptrollerAddress && !!sdk,
    staleTime: Infinity
  });

  return address === data;
};
