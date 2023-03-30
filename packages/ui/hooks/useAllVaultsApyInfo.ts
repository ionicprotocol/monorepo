import type { VaultApy } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { BigNumber } from 'ethers';
import { useMemo } from 'react';

import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useVaultsPerChain } from '@ui/hooks/useVaultsPerChain';

export type VaultInfo = (VaultApy & {
  decimals: number;
  underlyingPrice: BigNumber;
  usdPrice: number;
})[];

export function useVaultApyInfo(vaultAddress: string, chainId: number) {
  const enabledChains = useEnabledChains();
  const { vaultsPerChain } = useVaultsPerChain([...enabledChains]);

  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[chainId.toString()]) {
      return usdPrices[chainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, chainId]);

  return useQuery<VaultInfo | null>(
    ['useVaultApyInfo', chainId, vaultAddress, vaultsPerChain, usdPrice],
    async () => {
      const data = vaultsPerChain[chainId].data;

      if (data && data.length > 0 && usdPrice) {
        const vault = data.find((_vault) => _vault.vault === vaultAddress);

        if (vault) {
          const _vaultInfo: VaultApy[] = await axios
            .get(`/api/vaultApy?chainId=${chainId}&vaultAddress=${vaultAddress}`)
            .then((response) => response.data)
            .catch((error) => {
              console.error(`Unable to fetch vaults apy of chain \`${chainId}\``, error);

              return [];
            });

          return _vaultInfo.map((info) => ({
            ...info,
            decimals: vault.decimals,
            underlyingPrice: vault.underlyingPrice,
            usdPrice,
          }));
        } else {
          return null;
        }
      }

      return null;
    },
    {
      cacheTime: Infinity,
      enabled: Object.keys(vaultsPerChain).length > 0,
      staleTime: Infinity,
    }
  );
}
