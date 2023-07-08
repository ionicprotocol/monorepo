import type { SupportedChains } from '@ionicprotocol/types';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import type { Err, PositionsPerChainStatus } from '@ui/types/ComponentPropsType';

export const usePositionsPerChain = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiMidas();

  const positionQueries = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        enabled: !!chainId && !!address,
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && sdk && address) {
            return await sdk.getAllLeveredPositions(address).catch((e) => {
              console.warn(`Getting all levered positions error: `, { address, chainId }, e);

              return null;
            });
          } else {
            return null;
          }
        },
        queryKey: ['usePositionsPerChain', chainId, address],
      };
    }),
  });

  const [positionsPerChain, isLoading] = useMemo(() => {
    const _positionsPerChain: PositionsPerChainStatus = {};

    let isLoading = false;

    positionQueries.map((leverage, index) => {
      isLoading = isLoading || leverage.isLoading;
      const _chainId = chainIds[index];
      _positionsPerChain[_chainId.toString()] = {
        data: leverage.data,
        error: leverage.error as Err | undefined,
        isLoading: leverage.isLoading,
      };
    });

    return [_positionsPerChain, isLoading];
  }, [positionQueries, chainIds]);

  return { isLoading, positionsPerChain };
};
