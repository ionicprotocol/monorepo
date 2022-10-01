import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import { getComptrollerContract } from '@ui/utils/contracts';

export const useIsComptrollerAdmin = (
  comptrollerAddress?: string,
  poolChainId?: number
): boolean => {
  const { address } = useMultiMidas();
  const { data: sdk } = useSdk(poolChainId);

  const { data } = useQuery(
    ['isComptrollerAdmin', comptrollerAddress, sdk?.chainId],
    async () => {
      if (!comptrollerAddress || !sdk) return undefined;

      const comptroller = getComptrollerContract(comptrollerAddress, sdk);

      return await comptroller.callStatic.admin();
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!comptrollerAddress && !!sdk }
  );

  return address === data;
};
