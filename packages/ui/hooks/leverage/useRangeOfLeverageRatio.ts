import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export function useRangeOfLeverageRatio(address?: string, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['useRangeOfLeverageRatio', address, sdk],
    async () => {
      if (sdk && address) {
        const [minBignum, maxBignum] = await sdk.getRangeOfLeverageRatio(address);

        return {
          max: Number(Number(utils.formatUnits(maxBignum)).toFixed(3)),
          min: Number(Number(utils.formatUnits(minBignum)).toFixed(3)),
        };
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
