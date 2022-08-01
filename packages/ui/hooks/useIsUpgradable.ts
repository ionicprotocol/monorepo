import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const { midasSdk, currentChain } = useRari();

  const { data } = useQuery(
    ['useIsUpgradeable', currentChain.id, comptrollerAddress],
    async () => {
      const comptroller = midasSdk.createComptroller(comptrollerAddress);

      const isUpgradeable: boolean = await comptroller.callStatic.adminHasRights();

      return isUpgradeable;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!comptrollerAddress && !!currentChain.id }
  );

  return data;
};
