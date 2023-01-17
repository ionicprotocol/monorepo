import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useIRM = (cTokenAddress?: string, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useIRM', cTokenAddress, sdk?.chainId],
    async () => {
      if (cTokenAddress && sdk) {
        const cToken = sdk.getCTokenInstance(cTokenAddress);

        const irm = await cToken.callStatic.interestRateModel();

        return irm;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!cTokenAddress && !!sdk,
    }
  );
};
