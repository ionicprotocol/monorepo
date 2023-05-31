import type { AssetReward } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export interface UseAssetsData {
  [asset: string]: AssetReward[];
}
export function useMinLeverageRatio(address?: string, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useMinLeverageRatio', address, sdk],
    async () => {
      if (sdk && address) {
        const bignum = await sdk.getMinLeverageRatio(address);

        return Number(utils.formatUnits(bignum));
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!address && !!sdk,
      staleTime: Infinity,
    }
  );
}
