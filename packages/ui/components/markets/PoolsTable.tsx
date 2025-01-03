'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import { pools } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import {
  useMarketData,
  type MarketRowData
} from '@ui/hooks/market/useMarketData';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import APR from './Cells/APR';
import TokenBalance from './Cells/TokenBalance';
import CommonTable from '../../components/CommonTable';
import ActionButton from '../ActionButton';
import { CopyButton } from '../CopyButton';
import Loop from '../dialogs/loop';
import Swap from '../dialogs/ManageMarket/Swap';

import type {
  EnhancedColumnDef,
  MarketCellProps
} from '../../components/CommonTable';

function PoolsTable({
  marketData,
  isLoading,
  setIsManageDialogOpen,
  setIsBorrowDisabled,
  setSelectedSymbol,
  selectedSymbol
}: {
  marketData: MarketRowData[];
  isLoading: boolean;
  setIsManageDialogOpen: (value: boolean) => void;
  setIsBorrowDisabled: (value: boolean) => void;
  setSelectedSymbol: (value: string) => void;
  selectedSymbol?: string;
}) {
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const { address } = useMultiIonic();

  const [isLoopDialogOpen, setIsLoopDialogOpen] = useState<boolean>(false);
  const [swapOpen, setSwapOpen] = useState<boolean>(false);

  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();
  const { loopProps } = useMarketData(selectedPool, chain, selectedSymbol);

  const columns: EnhancedColumnDef<MarketRowData>[] = [
    {
      id: 'asset',
      header: <div className="pl-6">ASSETS</div>,
      sortingFn: 'alphabetical',
      width: '20%',
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{row.original.asset}</span>
              <CopyButton
                value={row.original.underlyingToken}
                message={`${row.original.asset} token address copied to clipboard`}
                tooltipMessage="Copy token address"
              />
            </div>
            <div className="flex flex-col text-xs text-white/40 font-light">
              <span>
                Total Supplied: ${row.original.supply.totalUSD.toLocaleString()}
              </span>
              <span>
                Total Borrowed: ${row.original.borrow.totalUSD.toLocaleString()}
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
      accessorFn: (row) => row.supplyAPRTotal,
      cell: ({ row }: MarketCellProps) => (
        <APR
          type="supply"
          baseAPR={row.original.supplyAPR}
          asset={row.original.asset}
          rewards={row.original.supplyRewards}
          dropdownSelectedChain={+chain}
          selectedPoolId={selectedPool}
          cToken={row.original.cTokenAddress}
          pool={row.original.comptrollerAddress}
          nativeAssetYield={row.original.nativeAssetYield}
          underlyingToken={row.original.underlyingToken}
          aprTotal={row.original.supplyAPRTotal}
        />
      )
    },
    {
      id: 'borrowAPRTotal',
      header: 'BORROW APR',
      sortingFn: 'numerical',
      accessorFn: (row) => row.borrowAPRTotal,
      cell: ({ row }: MarketCellProps) => (
        <APR
          type="borrow"
          baseAPR={row.original.borrowAPR}
          asset={row.original.asset}
          rewards={row.original.borrowRewards}
          dropdownSelectedChain={+chain}
          selectedPoolId={selectedPool}
          cToken={row.original.cTokenAddress}
          pool={row.original.comptrollerAddress}
          underlyingToken={row.original.underlyingToken}
          aprTotal={row.original.borrowAPRTotal}
        />
      )
    },
    {
      header: 'WALLET',
      id: 'walletBalance',
      sortingFn: (a, b) =>
        a.original.tokenBalance.amountUSD - b.original.tokenBalance.amountUSD,
      cell: ({ row }: MarketCellProps) => (
        <TokenBalance
          balance={row.original.tokenBalance.amount}
          balanceUSD={row.original.tokenBalance.amountUSD}
          tokenName={row.original.asset}
        />
      )
    },
    {
      id: 'supplyBalance',
      header: 'SUPPLIED',
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <TokenBalance
          balance={row.original.supply.balance}
          balanceUSD={row.original.supply.balanceUSD}
          tokenName={row.original.asset}
        />
      )
    },
    {
      id: 'borrowBalance',
      header: 'BORROWED',
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <TokenBalance
          balance={row.original.borrow.balance}
          balanceUSD={row.original.borrow.balanceUSD}
          tokenName={row.original.asset}
        />
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
          <ActionButton
            half={row.original.loopPossible}
            action={async () => {
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
            label="Manage"
          />
          {row.original.loopPossible && (
            <ActionButton
              action={async () => {
                const result = await handleSwitchOriginChain(+chain, chainId);
                if (result) {
                  setSelectedSymbol(row.original.asset);
                  setIsLoopDialogOpen(true);
                }
              }}
              half
              disabled={!address}
              label="Loop"
              bg="bg-lime"
            />
          )}
        </div>
      )
    }
  ];

  return (
    <>
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

      {loopProps && (
        <Loop
          {...loopProps}
          setIsOpen={setIsLoopDialogOpen}
          isOpen={isLoopDialogOpen}
        />
      )}

      {swapOpen && (
        <Swap
          close={() => setSwapOpen(false)}
          dropdownSelectedChain={+chain}
          selectedChain={chainId}
        />
      )}
    </>
  );
}

export default PoolsTable;
