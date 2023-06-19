import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export function usePositionInfo(position: string, supplyApy?: BigNumber, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['usePositionInfo', sdk?.chainId, position, supplyApy],
    async () => {
      if (sdk && supplyApy) {
        const info = await sdk.getPositionInfo(position, supplyApy).catch((e) => {
          console.warn(
            `Getting levered position info error: `,
            { chainId, position, supplyApy },
            e
          );

          return null;
        });

        return info;
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!sdk && !!position && !!supplyApy && !!chainId,
      staleTime: Infinity,
    }
  );
}
