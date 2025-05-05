import { useState, useEffect, useMemo } from 'react';

import { useReadContracts } from 'wagmi';

import { pools } from '@ui/constants/index';
import type { VaultRowData } from '@ui/types/SupplyVaults';

import { useTokenPrices, type TokenConfig } from '../useTokenPrices';

import type { Address } from 'viem';

const COMPOUND_MARKET_ABI = [
  {
    inputs: [],
    name: 'apr',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

const TOKEN_CONFIGS: TokenConfig[] = [
  {
    cgId: 'usd-coin',
    symbol: 'USDC'
  },
  {
    cgId: 'ethereum',
    symbol: 'WETH'
  }
];

const BASE_VAULT_DATA: VaultRowData[] = [
  {
    asset: 'USDC',
    logo: '/img/symbols/32/color/usdc.png',
    strategy: {
      description: 'Multi-pool lending optimization',
      distribution: [
        { poolName: 'Main Pool', percentage: 60 },
        { poolName: 'Native Pool', percentage: 40 }
      ]
    },
    apr: {
      total: 0,
      breakdown: [
        { source: 'Lending APR', value: 0 },
        { source: 'Rewards', value: 0 }
      ]
    },
    totalSupply: {
      tokens: 0,
      usd: 0
    },
    utilisation: 85,
    userPosition: {
      tokens: 0,
      usd: 0
    },
    vaultAddress: '0x1234567890123456789012345678901234567890' as Address,
    underlyingDecimals: 6,
    underlyingToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    underlyingSymbol: 'USDC',
    cToken: '0x6b175474e89094c44da98b954eedeac495271d0f'
  },
  {
    asset: 'WETH',
    logo: '/img/symbols/32/color/weth.png',
    strategy: {
      description: 'Isolated pool',
      distribution: [
        { poolName: 'Main Pool', percentage: 45 },
        { poolName: 'Native Pool', percentage: 55 }
      ]
    },
    apr: {
      total: 0,
      breakdown: [
        { source: 'Lending APR', value: 0 },
        { source: 'Rewards', value: 0 }
      ]
    },
    totalSupply: {
      tokens: 0,
      usd: 0
    },
    utilisation: 72,
    userPosition: {
      tokens: 0,
      usd: 0
    },
    vaultAddress: '0x2345678901234567890123456789012345678901' as Address,
    underlyingDecimals: 18,
    underlyingToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    underlyingSymbol: 'WETH',
    cToken: '0x6b175474e89094c44da98b954eedeac495271d0f'
  }
];

export function useSupplyVaultsData(chain: string): {
  vaultData: VaultRowData[];
  isLoading: boolean;
  error: Error | null;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [vaultData, setVaultData] = useState<VaultRowData[]>([]);

  const { data: tokenPrices, isLoading: isPricesLoading } =
    useTokenPrices(TOKEN_CONFIGS);

  const filteredVaultData = useMemo(() => {
    const chainConfig = pools[+chain];
    const vaultConfig = chainConfig.vaults?.[0];

    if (!vaultConfig) {
      return [];
    }

    return BASE_VAULT_DATA.filter((vault) =>
      vaultConfig.assets.includes(vault.asset)
    );
  }, [chain]);

  // Prepare contract reads for each vault
  const contractReads = useMemo(() => {
    return filteredVaultData.flatMap((vault) => [
      {
        address: vault.vaultAddress,
        abi: COMPOUND_MARKET_ABI,
        functionName: 'apr'
      },
      {
        address: vault.vaultAddress,
        abi: COMPOUND_MARKET_ABI,
        functionName: 'totalAssets'
      }
    ]);
  }, [filteredVaultData]);

  // Read contract data
  const { data: contractData, isLoading: isContractLoading } = useReadContracts(
    {
      contracts: contractReads,
      query: {
        enabled: contractReads.length > 0
      }
    }
  );

  useEffect(() => {
    if (!contractData) {
      return;
    }

    try {
      setIsLoading(true);

      // Update vault data with real values
      const updatedVaultData = filteredVaultData.map((vault, index) => {
        const aprData = contractData[index * 2];
        const totalAssetsData = contractData[index * 2 + 1];

        // Convert APR from contract (scaled by 1e18) to percentage
        let aprValue = 0;
        let lendingApr = 0;
        let rewardsApr = 0;

        if (aprData) {
          aprValue = Number(aprData) / 1e16;
          if (!Number.isFinite(aprValue)) aprValue = 0;

          lendingApr = aprValue * 0.7;
          rewardsApr = aprValue * 0.3;
        }

        // Convert total assets from contract
        let totalTokens = 0;
        if (totalAssetsData) {
          totalTokens =
            Number(totalAssetsData) / 10 ** vault.underlyingDecimals;
          if (!Number.isFinite(totalTokens)) totalTokens = 0;
        }

        // Get token price from our prices data
        const tokenPrice = tokenPrices?.[vault.asset]?.price ?? 0;
        const totalUsdValue = totalTokens * tokenPrice;

        return {
          ...vault,
          apr: {
            total: aprValue,
            breakdown: [
              { source: 'Lending APR', value: lendingApr },
              { source: 'Rewards', value: rewardsApr }
            ]
          },
          totalSupply: {
            tokens: totalTokens,
            usd: Number.isFinite(totalUsdValue) ? totalUsdValue : 0
          }
        };
      });

      setVaultData(updatedVaultData);
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing vault data:', err);
      setError(
        err instanceof Error ? err : new Error('Failed to fetch vault data')
      );
      setIsLoading(false);

      setVaultData(
        filteredVaultData.map((vault) => ({
          ...vault,
          apr: {
            total: 0,
            breakdown: [
              { source: 'Lending APR', value: 0 },
              { source: 'Rewards', value: 0 }
            ]
          },
          totalSupply: {
            tokens: 0,
            usd: 0
          }
        }))
      );
    }
  }, [contractData, filteredVaultData, tokenPrices]);

  return {
    vaultData,
    isLoading: isLoading || isPricesLoading || isContractLoading,
    error
  };
}
