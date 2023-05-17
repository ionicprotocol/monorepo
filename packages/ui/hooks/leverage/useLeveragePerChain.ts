import type { SupportedChains } from '@midas-capital/types';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import type { Err, LeveragePerChainStatus } from '@ui/types/ComponentPropsType';

export const useLeveragePerChain = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiMidas();
  console.log(address);

  const leverageQueries = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        cacheTime: Infinity,
        enabled: !!chainId && !!address,
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && sdk && address) {
            console.log(address);
            return await sdk.getAllLeveredPositions(address);
          } else {
            return null;
          }
        },
        queryKey: ['useLeveragePerChain', chainId, address],
        staleTime: Infinity,
      };
    }),
  });

  const [leveragePerChain, isLoading] = useMemo(() => {
    const _leveragePerChain: LeveragePerChainStatus = {};

    let isLoading = true;

    leverageQueries.map((leverage, index) => {
      isLoading = isLoading && leverage.isLoading;
      const _chainId = chainIds[index];
      _leveragePerChain[_chainId.toString()] = {
        data: leverage.data,
        error: leverage.error as Err | undefined,
        isLoading: leverage.isLoading,
      };
    });

    return [_leveragePerChain, isLoading];
  }, [leverageQueries, chainIds]);

  return { isLoading, leveragePerChain };
};
