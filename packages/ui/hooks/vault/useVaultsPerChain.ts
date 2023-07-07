import type { SupportedChains } from '@ionicprotocol/types';
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
            return await sdk.getAllVaults().catch((e) => {
              console.warn(`Getting all vaults error: `, { chainId }, e);

              return null;
            });
          } else {
            return null;
          }
        },
        queryKey: ['useVaultsPerChain', chainId, address],
        staleTime: Infinity,
      };
    }),
  });

  const [vaultsPerChain, isLoading] = useMemo(() => {
    const _vaultsPerChain: VaultsPerChainStatus = {};

    let isLoading = true;

    vaultsQueries.map((vaults, index) => {
      isLoading = isLoading && vaults.isLoading;
      const _chainId = chainIds[index];
      _vaultsPerChain[_chainId.toString()] = {
        data: vaults.data,
        error: vaults.error as Err | undefined,
        isLoading: vaults.isLoading,
      };
    });

    return [_vaultsPerChain, isLoading];
  }, [vaultsQueries, chainIds]);

  return { isLoading, vaultsPerChain };
};
