import type { SupportedChains } from '@midas-capital/types';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import type { Err, LeveragesPerChainStatus } from '@ui/types/ComponentPropsType';

export const useLeveragesPerChain = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiMidas();

  const leverageQueries = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        cacheTime: Infinity,
        enabled: !!chainId && !!address,
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && sdk && address) {
            return await sdk.getAllLeveredPositions();
          } else {
            return null;
          }
        },
        queryKey: ['useLeveragesPerChain', chainId, address],
        staleTime: Infinity,
      };
    }),
  });

  const [leveragesPerChain, isLoading] = useMemo(() => {
    const _leveragesPerChain: LeveragesPerChainStatus = {};

    let isLoading = true;

    leverageQueries.map((leverage, index) => {
      isLoading = isLoading && leverage.isLoading;
      const _chainId = chainIds[index];
      _leveragesPerChain[_chainId.toString()] = {
        data: leverage.data,
        error: leverage.error as Err | undefined,
        isLoading: leverage.isLoading,
      };
    });

    return [_leveragesPerChain, isLoading];
  }, [leverageQueries, chainIds]);

  return { isLoading, leveragesPerChain };
};
