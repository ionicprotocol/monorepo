'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import { pools } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketRowData } from '@ui/hooks/market/useMarketData';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import CommonTable from '../../_components/CommonTable';
import APRCell from '../../_components/markets/APRCell';

import type {
  EnhancedColumnDef,
  MarketCellProps
} from '../../_components/CommonTable';

function PoolsTable({
  marketData,
  isLoading,
  setIsManageDialogOpen,
  setIsLoopDialogOpen,
  setIsBorrowDisabled,
  setSelectedSymbol
}: {
  marketData: MarketRowData[];
  isLoading: boolean;
  setIsManageDialogOpen: (value: boolean) => void;
  setIsLoopDialogOpen: (value: boolean) => void;
  setIsBorrowDisabled: (value: boolean) => void;
  setSelectedSymbol: (value: string) => void;
}) {
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const { address } = useMultiIonic();

  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();

  const columns: EnhancedColumnDef<MarketRowData>[] = [
    {
      id: 'asset',
      header: <div className="pl-6">ASSETS</div>,
      sortingFn: 'alphabetical',
      cell: ({ row }: MarketCellProps) => (
        <Link
          href={{
            pathname: `/market/details/${row.original.asset}`,
            query: {
              chain,
              comptrollerAddress: row.original.comptrollerAddress,
              cTokenAddress: row.original.cTokenAddress,
              dropdownSelectedChain: chain,
              pool: selectedPool,
              borrowAPR: row.original.borrowAPR,
              supplyAPR: row.original.supplyAPR,
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
          <div className="flex flex-col">
            <span className="text-sm">{row.original.asset}</span>
            <div className="flex flex-col text-xs text-white/40 font-light">
              <span>
                Supplied: ${row.original.supply.totalUSD.split(' ')[0]}
              </span>
              <span>
                Borrowed: ${row.original.borrow.totalUSD.split(' ')[0]}
              </span>
            </div>
          </div>
        </Link>
      )
    },
    {
      id: 'supplyAPRTotal',
      header: 'SUPPLY APR',
      sortingFn: 'numerical',
      accessorFn: (row) => row.supplyAPR,
      cell: ({ row }: MarketCellProps) => (
        <APRCell
          type="supply"
          aprTotal={row.original.supplyAPRTotal ?? 0}
          baseAPR={row.original.supplyAPR}
          asset={row.original.asset}
          rewards={row.original.supplyRewards}
          dropdownSelectedChain={+chain}
          selectedPoolId={selectedPool}
          cToken={row.original.cTokenAddress}
          pool={row.original.comptrollerAddress}
        />
      )
    },
    {
      id: 'borrowAPRTotal',
      header: 'BORROW APR',
      sortingFn: 'numerical',
      accessorFn: (row) => row.borrowAPR,
      cell: ({ row }: MarketCellProps) => (
        <APRCell
          type="borrow"
          aprTotal={row.original.borrowAPRTotal ?? 0}
          baseAPR={row.original.borrowAPR}
          asset={row.original.asset}
          rewards={row.original.borrowRewards}
          dropdownSelectedChain={+chain}
          selectedPoolId={selectedPool}
          cToken={row.original.cTokenAddress}
          pool={row.original.comptrollerAddress}
        />
      )
    },
    {
      id: 'supplyBalance',
      header: 'SUPPLY BALANCE',
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <div className="flex flex-col items-start">
          <span>{row.original.supply.balance}</span>
          <span className="text-xs text-white/40 font-light">
            ${row.original.supply.balanceUSD}
          </span>
        </div>
      )
    },
    {
      id: 'borrowBalance',
      header: 'BORROW BALANCE',
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <div className="flex flex-col items-start">
          <span>{row.original.borrow.balance}</span>
          <span className="text-xs text-white/40 font-light">
            ${row.original.borrow.balanceUSD}
          </span>
        </div>
      )
    },
    {
      id: 'collateralFactor',
      header: 'COLLATERAL FACTOR',
      sortingFn: 'percentage',
      cell: ({ row }: MarketCellProps) => (
        <span>{row.original.collateralFactor}%</span>
      )
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      enableSorting: false,
      cell: ({ row }: MarketCellProps) => (
        <div className="flex gap-2 w-full pr-6">
          <button
            className={`rounded-md bg-accent text-black py-2.5 px-4 capitalize truncate disabled:opacity-50 ${
              row.original.loopPossible ? 'w-1/2' : 'w-full'
            }`}
            onClick={async () => {
              const result = await handleSwitchOriginChain(+chain, chainId);
              if (result) {
                setSelectedSymbol(row.original.asset);
                setIsManageDialogOpen(true);
                if (row.original.isBorrowDisabled) {
                  setIsBorrowDisabled(true);
                }
              }
            }}
            disabled={!address}
          >
            Manage
          </button>
          {row.original.loopPossible && (
            <button
              className="rounded-md bg-lime text-black py-2.5 px-4 capitalize truncate disabled:opacity-50 hover:bg-lime-400 w-1/2"
              onClick={async () => {
                const result = await handleSwitchOriginChain(+chain, chainId);
                if (result) {
                  setSelectedSymbol(row.original.asset);
                  setIsLoopDialogOpen(true);
                }
              }}
              disabled={!address}
            >
              Loop
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <CommonTable
      data={marketData}
      columns={columns}
      isLoading={isLoading}
      getRowStyle={(row) => ({
        badge: row.original.membership ? { text: 'Collateral' } : undefined,
        borderClassName: row.original.membership
          ? pools[+chain]?.border
          : undefined
      })}
    />
  );
}

export default PoolsTable;
