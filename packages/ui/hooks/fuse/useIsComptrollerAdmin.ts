import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useIsComptrollerAdmin = (comptrollerAddress?: string): boolean => {
  const { currentSdk, address } = useMultiMidas();

  const { data } = useQuery(
    ['isComptrollerAdmin', comptrollerAddress, currentSdk?.chainId],
    async () => {
      if (!comptrollerAddress || !currentSdk) return undefined;

      const comptroller = currentSdk.createComptroller(comptrollerAddress);

      return await comptroller.callStatic.admin();
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!comptrollerAddress && !!currentSdk }
  );

  return address === data;
};
