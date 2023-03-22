import type { SupportedChains } from '@midas-capital/types';
import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import type { Err, VaultsPerChainStatus } from '@ui/types/ComponentPropsType';

export const useVaultsPerChain = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiMidas();

  const vaultsQueries = useQueries({
    queries: chainIds.map((chainId) => {
      return {
        queryKey: ['useVaultsPerChain', chainId, address],
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && sdk) {
            return await sdk.getAllVaults();
          } else {
            return null;
          }
        },
        cacheTime: Infinity,
        staleTime: Infinity,
        enabled: !!chainId,
      };
    }),
  });

  const [vaultsPerChain, isLoading, error] = useMemo(() => {
    const _vaultsPerChain: VaultsPerChainStatus = {};

    let isLoading = true;
    let isError = true;
    let error: Err | undefined;

    vaultsQueries.map((vaults, index) => {
      isLoading = isLoading && vaults.isLoading;
      isError = isError && vaults.isError;
      error = isError ? (vaults.error as Err) : undefined;
      const _chainId = chainIds[index];
      _vaultsPerChain[_chainId.toString()] = {
        isLoading: vaults.isLoading,
        error: vaults.error as Err | undefined,
        data: vaults.data,
      };
    });

    return [_vaultsPerChain, isLoading, error];
  }, [vaultsQueries, chainIds]);

  return { vaultsPerChain, isLoading, error };
};
