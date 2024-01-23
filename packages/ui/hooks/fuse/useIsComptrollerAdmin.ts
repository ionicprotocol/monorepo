import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useIsComptrollerAdmin = (
  comptrollerAddress?: string,
  poolChainId?: number
): boolean => {
  const { address } = useMultiMidas();
  const sdk = useSdk(poolChainId);

  const { data } = useQuery(
    ['isComptrollerAdmin', comptrollerAddress, sdk?.chainId],
    async () => {
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
    {
      cacheTime: Infinity,
      enabled: !!comptrollerAddress && !!sdk,
      staleTime: Infinity
    }
  );

  return address === data;
};
