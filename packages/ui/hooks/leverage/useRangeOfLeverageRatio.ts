import { useQuery } from '@tanstack/react-query';
import { formatEther } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';

import type { Address } from 'viem';

export function useRangeOfLeverageRatio(address?: Address, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: ['useRangeOfLeverageRatio', address, sdk?.chainId],

    queryFn: async () => {
      if (sdk && address) {
        const [minBignum, maxBignum] = await sdk
          .getRangeOfLeverageRatio(address)
          .catch((e) => {
            console.warn(
              `Getting range of leverage ratio error: `,
              { address, chainId },
              e
            );

            return [0n, 0n];
          });

        return {
          max: Number(Number(formatEther(maxBignum)).toFixed(3)),
          min: Number(Number(formatEther(minBignum)).toFixed(3))
        };
      } else {
        return null;
      }
    },

    enabled: !!address && !!sdk,
    staleTime: Infinity
  });
}
