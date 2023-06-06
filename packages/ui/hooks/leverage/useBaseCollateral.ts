import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useBaseCollateral(position: string, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useBaseCollateral', sdk?.chainId, position],
    async () => {
      if (sdk) {
        const baseCollateral = await sdk.getBaseCollateral(position);

        return baseCollateral;
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
