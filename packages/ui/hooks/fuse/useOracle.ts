import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useOracle = (comptrollerAddress?: string, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useOracle', comptrollerAddress, sdk?.chainId],
    async () => {
      if (comptrollerAddress && sdk) {
        const comptroller = sdk.getComptrollerInstance(comptrollerAddress);

        const oracle = await comptroller.oracle();

        return oracle;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!comptrollerAddress && !!sdk,
    }
  );
};
