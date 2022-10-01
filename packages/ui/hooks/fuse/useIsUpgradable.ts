import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { getComptrollerContract } from '@ui/utils/contracts';

export const useIsUpgradeable = (comptrollerAddress: string, poolChainId: number) => {
  const { data: sdk } = useSdk(poolChainId);

  const { data } = useQuery(
    ['useIsUpgradeable', comptrollerAddress, sdk?.chainId],
    async () => {
      if (sdk) {
        const comptroller = getComptrollerContract(comptrollerAddress, sdk);
        const isUpgradeable: boolean = await comptroller.callStatic.adminHasRights();

        return isUpgradeable;
      }
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!comptrollerAddress && !!sdk }
  );

  return data;
};
