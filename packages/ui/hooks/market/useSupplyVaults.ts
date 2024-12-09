// hooks/market/useSupplyVaults.ts
import { useState, useEffect } from 'react';

import type { Address, Hex } from 'viem';

export interface VaultRowData {
  asset: string;
  logo: string;
  strategy: {
    description: string;
    distribution: Array<{
      poolName: string;
      percentage: number;
    }>;
  };
  apr: {
    total: number;
    breakdown: Array<{
      source: string;
      value: number;
    }>;
  };
  totalSupply: {
    tokens: string;
    usd: string;
  };
  utilisation: number;
  userPosition: {
    tokens: string;
    usd: string;
  };
  vaultAddress: string;
  underlyingToken: Hex;
  underlyingDecimals: number;
  underlyingSymbol: string;
  cToken: Address;
}

interface UseSupplyVaultsReturn {
  vaultData: VaultRowData[];
  isLoading: boolean;
  error: Error | null;
}

export function useSupplyVaults(
  chain: string,
  address?: string
): UseSupplyVaultsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const mockVaultData: VaultRowData[] = [
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
        tokens: '2.5M USDC',
        usd: '2,500,000'
      },
      utilisation: 85,
      userPosition: {
        tokens: '1,000 USDC',
        usd: '1,000'
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
        description: 'Cross-chain yield aggregation',
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
        tokens: '1.2K WETH',
        usd: '3,000,000'
      },
      utilisation: 72,
      userPosition: {
        tokens: '5 WETH',
        usd: '12,500'
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
        tokens: '180 WBTC',
        usd: '7,200,000'
      },
      utilisation: 65,
      userPosition: {
        tokens: '0.5 WBTC',
        usd: '20,000'
      },
      vaultAddress: '0x3456789012345678901234567890123456789012' as Address,
      underlyingDecimals: 18,
      underlyingToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
      underlyingSymbol: 'WBTC',
      cToken: '0x6b175474e89094c44da98b954eedeac495271d0f'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
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
    vaultData: mockVaultData,
    isLoading,
    error
  };
}
