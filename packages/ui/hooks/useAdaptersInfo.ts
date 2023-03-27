import type { Adapter } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export function useAdaptersInfo(adapters: Adapter[], chainId: number) {
  const { getSdk } = useMultiMidas();

  return useQuery(
    ['useAdaptersInfo', chainId, adapters],
    async () => {
      const sdk = getSdk(chainId);

      if (sdk) {
        return await sdk.getInfoFromAdapters(adapters);
      } else {
        return null;
      }
    },
    { cacheTime: Infinity, enabled: adapters.length > 0 && !!chainId, staleTime: Infinity }
  );
}
