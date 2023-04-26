import type { AssetPrice } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useAssetPrice(underlyingAddress: string, chainId: number) {
  return useQuery<AssetPrice[] | null>(
    ['useAssetPrice', chainId, underlyingAddress],
    async () => {
      if (chainId && underlyingAddress) {
        const info: AssetPrice[] = await axios
          .get(`/api/assetPrice?chainId=${chainId}&underlyingAddress=${underlyingAddress}`)
          .then((response) => response.data)
          .catch((error) => {
            console.error(`Unable to fetch asset price of chain \`${chainId}\``, error);

            return [];
          });

        return info;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!chainId && !!underlyingAddress,
      staleTime: Infinity,
    }
  );
}
