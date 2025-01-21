import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { AssetReward } from '@ionicprotocol/types';

export interface UseAssetsData {
  [asset: string]: AssetReward[];
}
export function useAssets(chainIds?: number[]) {
  return useQuery({
    queryKey: ['useAssetsAPI', chainIds?.sort()],

    queryFn: async () => {
      let assetsRewards: UseAssetsData = {};

      if (chainIds && chainIds.length > 0) {
        try {
          const res = await axios.post('/api/assets', {
            chainIds
          });

          assetsRewards = { ...res.data };
        } catch (e) {
          assetsRewards = {};
        }
      }

      return assetsRewards;
    },

    enabled: !!chainIds && chainIds.length > 0,
    staleTime: Infinity
  });
}
