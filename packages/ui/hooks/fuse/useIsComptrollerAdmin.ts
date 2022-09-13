import { useQuery } from '@tanstack/react-query';

import { useMidas } from '@ui/context/MidasContext';

export const useIsComptrollerAdmin = (comptrollerAddress?: string): boolean => {
  const { midasSdk, address } = useMidas();

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
