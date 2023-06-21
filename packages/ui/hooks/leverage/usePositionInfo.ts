import type { MidasSdk } from '@midas-capital/sdk';
import type { PositionInfo } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const getPositionInfo = async (position: string, supplyApy: BigNumber, sdk: MidasSdk) => {
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

export function usePositionInfo(position: string, supplyApy?: BigNumber, chainId?: number) {
  const sdk = useSdk(chainId);

  return useQuery(
    ['usePositionInfo', sdk?.chainId, position, supplyApy],
    async () => {
      if (sdk && supplyApy) {
        return await getPositionInfo(position, supplyApy, sdk);
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

export function usePositionsInfo(
  positions: string[],
  totalApys?: (BigNumber | null)[],
  chainIds?: number[]
) {
  const { getSdk } = useMultiMidas();

  return useQuery(
    ['usePositionsInfo', positions, totalApys, chainIds],
    async () => {
      if (chainIds && chainIds.length > 0 && totalApys) {
        const res: { [position: string]: PositionInfo } = {};

        await Promise.all(
          chainIds.map(async (chainId, i) => {
            const sdk = getSdk(chainId);
            const position = positions[i];
            const totalApy = totalApys[i];

            if (sdk && totalApy) {
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
    {
      cacheTime: Infinity,
      enabled: !!positions && !!totalApys && !!chainIds,
      staleTime: Infinity,
    }
  );
}
