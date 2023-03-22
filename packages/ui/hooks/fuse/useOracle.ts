import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useOracle = (underlyingAddress?: string, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useOracle', underlyingAddress, sdk?.chainId],
    async () => {
      if (underlyingAddress && sdk) {
        const mpo = sdk.createMasterPriceOracle(sdk.provider);
        const oracle = await mpo.callStatic.oracles(underlyingAddress);

        return oracle;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!underlyingAddress && !!sdk,
      staleTime: Infinity,
    }
  );
};
