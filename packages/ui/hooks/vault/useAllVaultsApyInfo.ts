import type { VaultApy } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo } from 'react';
import { Address, formatEther, formatUnits } from 'viem';

import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useEnabledChains } from '@ui/hooks/useChainConfig';
import { useVaultsPerChain } from '@ui/hooks/vault/useVaultsPerChain';

export type VaultInfo = {
  supplyApy: number;
  totalSupplyRated: number;
  totalSupplyUsd: number;
  xAxis: number;
}[];

export function useVaultApyInfo(vaultAddress: Address, chainId: number) {
  const enabledChains = useEnabledChains();
  const { vaultsPerChain } = useVaultsPerChain([
    ...enabledChains.map((chain) => chain.id)
  ]);

  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[chainId.toString()]) {
      return usdPrices[chainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, chainId]);

  return useQuery({
    queryKey: [
      'useVaultApyInfo',
      chainId,
      vaultAddress,
      vaultsPerChain,
      usdPrice
    ],

    queryFn: async () => {
      const data = vaultsPerChain[chainId].data;

      if (data && data.length > 0 && usdPrice) {
        const vault = data.find((_vault) => _vault.vault === vaultAddress);

        if (vault) {
          const _vaultInfo: VaultApy[] = await axios
            .get(
              `/api/vaultApy?chainId=${chainId}&vaultAddress=${vaultAddress}`
            )
            .then((response) => response.data)
            .catch((error) => {
              console.error(
                `Unable to fetch vaults apy of chain \`${chainId}\``,
                error
              );

              return [];
            });

          const maxSupply = _vaultInfo.reduce((_max, info) => {
            if (BigInt(info.totalSupply) > _max) {
              _max = BigInt(info.totalSupply);
            }

            return _max;
          }, 0n);

          return _vaultInfo.map((info) => {
            const supplyApy = Number((Number(info.supplyApy) * 100).toFixed(2));
            const totalSupplyRated =
              (Number(formatEther(BigInt(info.totalSupply))) /
                Number(formatEther(maxSupply))) *
              100;

            const totalSupplyUsd =
              Number(formatUnits(BigInt(info.totalSupply), vault.decimals)) *
              Number(formatUnits(vault.underlyingPrice, 18)) *
              usdPrice;

            return {
              supplyApy,
              totalSupplyRated,
              totalSupplyUsd,
              xAxis: info.createdAt
            };
          });
        } else {
          return null;
        }
      }

      return null;
    },

    gcTime: Infinity,
    enabled: Object.keys(vaultsPerChain).length > 0,
    staleTime: Infinity
  });
}
