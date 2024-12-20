import { useState, useEffect, useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { pools } from '@ui/constants/index';
import { VaultRowData } from '@ui/types/SupplyVaults';

// CompoundMarketERC4626 ABI (only the functions we need)
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

interface UseSupplyVaultsRealDataReturn {
  vaultData: VaultRowData[];
  isLoading: boolean;
  error: Error | null;
}

// Base data structure similar to ALL_VAULT_DATA
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
      total: 0, // Will be updated with real data
      breakdown: [
        { source: 'Lending APR', value: 0 }, // Will be updated
        { source: 'Rewards', value: 0 }
      ]
    },
    totalSupply: {
      tokens: 0, // Will be updated with real data
      usd: 0
    },
    utilisation: 85,
    userPosition: {
      tokens: 0,
      usd: 0
    },
    vaultAddress: '0x1234567890123456789012345678901234567890' as Address,
    underlyingDecimals: 6, // USDC has 6 decimals
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
    underlyingDecimals: 18, // WETH has 18 decimals
    underlyingToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
    underlyingSymbol: 'WETH',
    cToken: '0x6b175474e89094c44da98b954eedeac495271d0f'
  }
];

export function useSupplyVaultsRealData(
  chain: string,
  address?: string
): UseSupplyVaultsRealDataReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [vaultData, setVaultData] = useState<VaultRowData[]>([]);

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
  const { data: contractData } = useReadContracts({
    contracts: contractReads,
    query: {
      enabled: contractReads.length > 0
    }
  });

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

        if (!aprData || !totalAssetsData) {
          return vault;
        }

        // Convert APR from contract (scaled by 1e18) to percentage
        const aprValue = Number(aprData) / 1e16; // Divide by 1e16 to convert to percentage
        // Assume 70% of APR is from lending and 30% from rewards for this example
        const lendingApr = aprValue * 0.7;
        const rewardsApr = aprValue * 0.3;

        // Convert total assets from contract (in underlying token decimals)
        const totalTokens =
          Number(totalAssetsData) / 10 ** vault.underlyingDecimals;

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
            usd: totalTokens * (vault.asset === 'WETH' ? 2500 : 1) // Mock price for example
          }
        };
      });

      setVaultData(updatedVaultData);
      setIsLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch vault data')
      );
      setIsLoading(false);
    }
  }, [contractData, filteredVaultData]);

  return {
    vaultData,
    isLoading,
    error
  };
}
