import { useQuery } from 'react-query';

import { useMidas } from '@ui/context/MidasContext';

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const { midasSdk } = useMidas();

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
