import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useCurrentLeverageRatio(position: string, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useCurrentLeverageRatio', sdk?.chainId, position],
    async () => {
      if (sdk) {
        const currentLeverageRatio = await sdk.getCurrentLeverageRatio(position).catch((e) => {
          console.warn(`Getting current leverage ratio error: `, { chainId, position }, e);

          return null;
        });

        return currentLeverageRatio;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!sdk && !!position,
      staleTime: Infinity,
    }
  );
}
