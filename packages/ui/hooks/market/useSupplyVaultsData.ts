import { useState, useEffect, useMemo } from 'react';
import type { Address, Hex } from 'viem';
import { pools } from '@ui/constants/index';
import { VaultRowData } from '@ui/types/SupplyVaults';

interface UseSupplyVaultsReturn {
  vaultData: VaultRowData[];
  isLoading: boolean;
  error: Error | null;
}

const ALL_VAULT_DATA: VaultRowData[] = [
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
      total: 12.5,
      breakdown: [
        { source: 'Lending APR', value: 8.2 },
        { source: 'Rewards', value: 4.3 }
      ]
    },
    totalSupply: {
      tokens: 25000000,
      usd: 25000000
    },
    utilisation: 85,
    userPosition: {
      tokens: 1000,
      usd: 1000
    },
    vaultAddress: '0x1234567890123456789012345678901234567890' as Address,
    underlyingDecimals: 18,
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
      total: 8.7,
      breakdown: [
        { source: 'Lending APR', value: 5.5 },
        { source: 'Rewards', value: 3.2 }
      ]
    },
    totalSupply: {
      tokens: 1200,
      usd: 3000000
    },
    utilisation: 72,
    userPosition: {
      tokens: 5,
      usd: 12500
    },
    vaultAddress: '0x2345678901234567890123456789012345678901' as Address,
    underlyingDecimals: 18,
    underlyingToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    underlyingSymbol: 'WETH',
    cToken: '0x6b175474e89094c44da98b954eedeac495271d0f'
  },
  {
    asset: 'WBTC',
    logo: '/img/symbols/32/color/wbtc.png',
    strategy: {
      description: 'Bitcoin-backed lending strategy',
      distribution: [
        { poolName: 'Main Pool', percentage: 70 },
        { poolName: 'Native Pool', percentage: 30 }
      ]
    },
    apr: {
      total: 6.8,
      breakdown: [
        { source: 'Lending APR', value: 4.8 },
        { source: 'Rewards', value: 2.0 }
      ]
    },
    totalSupply: {
      tokens: 180,
      usd: 7200000
    },
    utilisation: 65,
    userPosition: {
      tokens: 0.5,
      usd: 20000
    },
    vaultAddress: '0x3456789012345678901234567890123456789012' as Address,
    underlyingDecimals: 18,
    underlyingToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    underlyingSymbol: 'WBTC',
    cToken: '0x6b175474e89094c44da98b954eedeac495271d0f'
  }
];

export function useSupplyVaultsData(
  chain: string,
  address?: string
): UseSupplyVaultsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const filteredVaultData = useMemo(() => {
    const chainConfig = pools[+chain];
    const vaultConfig = chainConfig.vaults?.[0];

    if (!vaultConfig) {
      return [];
    }

    return ALL_VAULT_DATA.filter((vault) =>
      vaultConfig.assets.includes(vault.asset)
    );
  }, [chain]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch vault data')
        );
        setIsLoading(false);
      }
    };

    fetchData();
  }, [chain, address]);

  return {
    vaultData: filteredVaultData,
    isLoading,
    error
  };
}
