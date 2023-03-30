import type { VaultApy } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useEnabledChains } from '@ui/hooks/useChainConfig';

export type VaultsResponse = {
  [vault: string]: VaultApy;
};

export function useAllVaultsApyInfo() {
  const enabledChains = useEnabledChains();
  const { address } = useMultiMidas();

  return useQuery<VaultsResponse | null>(
    ['useAllVaultsApyInfo', enabledChains, address],
    async () => {
      if (enabledChains.length > 0) {
        let vaultInfos: VaultsResponse = {};

        await Promise.all(
          enabledChains.map(async (chainId) => {
            const _vaultInfos: VaultsResponse = await axios
              .get(`/api/vaults?chainId=${chainId}`)
              .then((response) => response.data)
              .catch((error) => {
                console.error(`Unable to fetch vaults apy of chain \`${chainId}\``, error);

                return {};
              });

            vaultInfos = { ...vaultInfos, ..._vaultInfos };
          })
        );

        return vaultInfos;
      }

      return null;
    },
    {
      cacheTime: Infinity,
      enabled: enabledChains.length > 0,
      staleTime: Infinity,
    }
  );
}
