import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const { midasSdk } = useRari();

  const { data } = useQuery(
    comptrollerAddress + ' isUpgradeable',
    async () => {
      const comptroller = midasSdk.createComptroller(comptrollerAddress);

      const isUpgradeable: boolean = await comptroller.callStatic.adminHasRights();

      return isUpgradeable;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!comptrollerAddress }
  );

  return data;
};
