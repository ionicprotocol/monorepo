import type { AssetReward } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface UseAssetsData {
  [asset: string]: AssetReward[];
}
export function useAssets(chainId?: number) {
  return useQuery<UseAssetsData>(
    ['useAssetsAPI', chainId],
    async () => {
      return axios
        .get(`/api/assets?chainId=${chainId}`)
        .then((response) => response.data)
        .catch((error) => {
          console.error(`Unable to fetch assets of chain \`${chainId}\``, error);
          return {};
        });
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
    }
  );
}
