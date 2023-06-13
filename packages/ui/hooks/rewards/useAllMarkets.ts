import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useAllMarkets = (chainId?: number) => {
  const { address } = useMultiMidas();
  const sdk = useSdk(chainId);

  return useQuery<string[] | undefined>(
    ['useAllMarkets', sdk?.chainId, address],
    async () => {
      if (sdk) {
        return await sdk.getAllMarkets();
      } else {
        return [];
      }
    },
    { cacheTime: Infinity, enabled: !!sdk && !!address, staleTime: Infinity }
  );
};
