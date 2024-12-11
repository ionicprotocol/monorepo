import { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import { pools } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import CommonTable from '../../_components/CommonTable';

import type { EnhancedColumnDef } from '../../_components/CommonTable';

// Types
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
}

// Table Component
export default function SupplyVaultTable({
  marketData,
  isLoading,
  setIsManageDialogOpen,
  setSelectedSymbol
}: {
  marketData: VaultRowData[];
  isLoading: boolean;
  setIsManageDialogOpen: (value: boolean) => void;
  setSelectedSymbol: (value: string) => void;
}) {
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const { address } = useMultiIonic();

  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : mode.id.toString();

  const columns: EnhancedColumnDef<VaultRowData>[] = [
    {
      id: 'asset',
      header: <div className="pl-6">ASSETS</div>,
      sortingFn: 'alphabetical',
      cell: ({ row }) => (
        <Link
          href={{
            pathname: `/market/vault/${row.original.asset}`,
            query: {
              chain,
              dropdownSelectedChain: chain,
              selectedChain: chainId,
              selectedSymbol: row.original.asset
            }
          }}
          className="flex gap-3 items-center pl-6"
        >
          <Image
            src={row.original.logo}
            alt={row.original.asset}
            width={28}
            height={28}
            className="w-7 h-7"
          />
          <span className="text-sm">{row.original.asset}</span>
        </Link>
      )
    },
    {
      id: 'strategy',
      header: 'STRATEGY',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm">{row.original.strategy.description}</span>
          <div className="flex flex-wrap gap-1">
            {row.original.strategy.distribution.map((dist, idx) => (
              <span
                key={idx}
                className="text-xs text-white/40"
              >
                {dist.poolName}: {dist.percentage}%
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'apr',
      header: 'APR',
      sortingFn: 'numerical',
      accessorFn: (row) => row.apr.total,
      cell: ({ row }) => <span>{row.original.apr.total.toFixed(2)}%</span>
    },
    {
      id: 'totalSupply',
      header: 'TOTAL SUPPLY',
      sortingFn: 'numerical',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.totalSupply.tokens}</span>
          <span className="text-xs text-white/40">
            ${row.original.totalSupply.usd}
          </span>
        </div>
      )
    },
    {
      id: 'utilisation',
      header: 'UTILISATION RATE',
      sortingFn: 'numerical',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-white/10 rounded-full h-2">
            <div
              className="bg-accent h-full rounded-full"
              style={{ width: `${row.original.utilisation}%` }}
            />
          </div>
          <span>{row.original.utilisation}%</span>
        </div>
      )
    },
    {
      id: 'userPosition',
      header: 'YOUR POSITION',
      sortingFn: 'numerical',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.userPosition.tokens}</span>
          <span className="text-xs text-white/40">
            ${row.original.userPosition.usd}
          </span>
        </div>
      )
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2 w-full pr-6">
          <button
            className={`rounded-md ${pools[+chain].bg} text-black py-2.5 px-4 w-full capitalize truncate disabled:opacity-50`}
            onClick={async () => {
              const result = await handleSwitchOriginChain(+chain, chainId);
              if (result) {
                setSelectedSymbol(row.original.asset);
                setIsManageDialogOpen(true);
              }
            }}
            disabled={!address}
          >
            Supply
          </button>
        </div>
      )
    }
  ];

  return (
    <CommonTable
      data={marketData}
      columns={columns}
      isLoading={isLoading}
    />
  );
}
