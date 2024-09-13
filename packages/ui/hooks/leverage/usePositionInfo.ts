import type { IonicSdk } from '@ionicprotocol/sdk';
import type { PositionInfo } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const getPositionInfo = async (
  position: Address,
  supplyApy: bigint,
  sdk: IonicSdk
) => {
  const info = await sdk.getPositionInfo(position, supplyApy).catch((e) => {
    console.warn(
      `Getting levered position info error: `,
      { chainId: sdk.chainId, position, supplyApy },
      e
    );

    return null;
  });

  return info;
};

export function usePositionInfo(
  position: Address,
  supplyApy?: bigint,
  chainId?: number
) {
  const sdk = useSdk(chainId);

  return useQuery({
    queryKey: ['usePositionInfo', sdk?.chainId, position, supplyApy],

    queryFn: async () => {
      return await getPositionInfo(position, supplyApy!, sdk!);
    },

    gcTime: Infinity,
    enabled: !!sdk && !!position && typeof supplyApy === 'bigint' && !!chainId,
    staleTime: Infinity
  });
}

export function usePositionsInfo(
  positions: Address[],
  totalApys?: (bigint | null)[],
  chainIds?: number[]
) {
  const { getSdk } = useMultiIonic();

  return useQuery({
    queryKey: ['usePositionsInfo', positions, totalApys, chainIds],

    queryFn: async () => {
      if (chainIds && chainIds.length > 0 && totalApys) {
        const res: { [position: string]: PositionInfo } = {};

        await Promise.all(
          chainIds.map(async (chainId, i) => {
            const sdk = getSdk(chainId);
            const position = positions[i];
            const totalApy = totalApys[i];

            if (sdk && typeof totalApy === 'bigint') {
              const info = await getPositionInfo(position, totalApy, sdk);

              if (info) {
                res[position] = info;
              }
            }
          })
        );

        return res;
      } else {
        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!positions && !!totalApys && !!chainIds,
    staleTime: Infinity
  });
}
