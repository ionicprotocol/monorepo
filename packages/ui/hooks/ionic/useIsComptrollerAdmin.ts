import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useIsComptrollerAdmin = (
  comptrollerAddress?: string,
  poolChainId?: number
): boolean => {
  const { address } = useMultiIonic();
  const sdk = useSdk(poolChainId);

  const { data } = useQuery(
    ['isComptrollerAdmin', comptrollerAddress, sdk?.chainId],
    async () => {
      if (!comptrollerAddress || !sdk) return null;

      try {
        const comptroller = sdk.createComptroller(comptrollerAddress);

        return await comptroller.callStatic.admin();
      } catch (e) {
        console.warn(`Checking comptroller admin error: `, { comptrollerAddress, poolChainId }, e);

        return null;
      }
    },
    { enabled: !!comptrollerAddress && !!sdk }
  );

  return address === data;
};
