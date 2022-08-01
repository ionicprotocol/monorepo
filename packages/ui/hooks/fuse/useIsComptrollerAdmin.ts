import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const useIsComptrollerAdmin = (comptrollerAddress?: string): boolean => {
  const { midasSdk, address } = useRari();

  const { data } = useQuery(
    ['isComptrollerAdmin', comptrollerAddress],
    async () => {
      if (!comptrollerAddress) return undefined;

      const comptroller = midasSdk.createComptroller(comptrollerAddress);

      return await comptroller.callStatic.admin();
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!comptrollerAddress }
  );

  return address === data;
};
