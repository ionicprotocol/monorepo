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
        cacheTime: Infinity,
        enabled: !!chainId,
        queryFn: async () => {
          const sdk = getSdk(Number(chainId));

          if (chainId && sdk) {
            return await sdk.getAllVaults();
          } else {
            return null;
          }
        },
        queryKey: ['useVaultsPerChain', chainId, address],
        staleTime: Infinity,
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
        data: vaults.data,
        error: vaults.error as Err | undefined,
        isLoading: vaults.isLoading,
      };
    });

    return [_vaultsPerChain, isLoading, error];
  }, [vaultsQueries, chainIds]);

  return { error, isLoading, vaultsPerChain };
};
