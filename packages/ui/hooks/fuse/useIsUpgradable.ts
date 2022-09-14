import { useQuery } from '@tanstack/react-query';

import { useMidas } from '@ui/context/MidasContext';

export const useIsUpgradeable = (comptrollerAddress: string) => {
  const {
    midasSdk,
    currentChain: { id },
  } = useMidas();

  const { data } = useQuery(
    ['useIsUpgradeable', id, comptrollerAddress],
    async () => {
      const comptroller = midasSdk.createComptroller(comptrollerAddress);

      const isUpgradeable: boolean = await comptroller.callStatic.adminHasRights();

      return isUpgradeable;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!comptrollerAddress }
  );

  return data;
};
