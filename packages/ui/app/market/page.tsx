'use client';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import { pools } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketRowData } from '@ui/hooks/market/useMarketData';
import { useMarketData } from '@ui/hooks/market/useMarketData';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import ActionButton from '../_components/ActionButton';
import CommonTable from '../_components/CommonTable';
import Loop from '../_components/dialogs/loop';
import ManageDialog from '../_components/dialogs/manage';
import Swap from '../_components/dialogs/manage/Swap';
import APRCell from '../_components/markets/APRCell';
import FeaturedMarketTile from '../_components/markets/FeaturedMarketTile';
import FilterBar from '../_components/markets/FilterBar';
import StakingTile from '../_components/markets/StakingTile';
import TotalTvlTile from '../_components/markets/TotalTvlTile';
import TvlTile from '../_components/markets/TvlTile';

import type { EnhancedColumnDef } from '../_components/CommonTable';
import type { Row } from '@tanstack/react-table';

const NetworkSelector = dynamic(
  () => import('../_components/markets/NetworkSelector'),
  { ssr: false }
);

interface MarketCellProps {
  row: Row<MarketRowData>;
  getValue: () => any;
}

export default function Market() {
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const { address } = useMultiIonic();

  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();

  const [swapOpen, setSwapOpen] = useState<boolean>(false);
  const [swapWidgetOpen, setSwapWidgetOpen] = useState<boolean>(false);
  const [wrapWidgetOpen, setWrapWidgetOpen] = useState<boolean>(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState<boolean>(false);
  const [isLoopDialogOpen, setIsLoopDialogOpen] = useState<boolean>(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>();
  const [isBorrowDisabled, setIsBorrowDisabled] = useState<boolean>(false);
  const [filteredMarketData, setFilteredMarketData] = useState<MarketRowData[]>(
    []
  );

  const {
    marketData,
    selectedMarketData,
    featuredMarkets,
    isLoading,
    poolData,
    loopProps
  } = useMarketData(selectedPool, chain, selectedSymbol);

  useEffect(() => {
    setFilteredMarketData(marketData);
  }, [marketData]);

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
      accessorFn: (row) => row.borrowAPR,
      cell: ({ row }: MarketCellProps) => (
        <APRCell
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
      <div className="w-full flex flex-col items-center justify-start transition-all duration-200 ease-linear">
        <div className="w-full grid lg:grid-cols-9 md:grid-cols-8 grid-cols-1 flex-col items-start justify-start bg-darkone h-min rounded-xl gap-2">
          <div className="grid gap-y-2 col-span-3 h-full">
            <TotalTvlTile />
            <TvlTile
              isLoadingPoolData={isLoading}
              dropdownSelectedChain={chain}
              poolData={poolData!}
              isLoadingLoopMarkets={false}
              selectedPool={selectedPool}
            />
          </div>
          <FeaturedMarketTile
            isLoadingPoolData={isLoading}
            dropdownSelectedChain={chain}
            selectedChain={chainId}
            setSelectedSymbol={setSelectedSymbol}
            swapWidgetOpen={swapWidgetOpen}
            wrapWidgetOpen={wrapWidgetOpen}
            setIsManageDialogOpen={setIsManageDialogOpen}
            setSwapWidgetOpen={setSwapWidgetOpen}
            setWrapWidgetOpen={setWrapWidgetOpen}
            featuredMarkets={featuredMarkets}
          />
          <StakingTile chain={+chain} />
        </div>

        <div className="w-full my-4 flex flex-wrap">
          <NetworkSelector
            dropdownSelectedChain={+chain}
            upcomingChains={[
              'Superseed',
              'MetalL2',
              'Ozean',
              'Soneium',
              'Camp',
              'FX',
              'Kroma',
              'Unichain'
            ]}
          />
        </div>
        <div className="bg-grayone w-full rounded-xl py-4 px-4 lg:px-[1%] xl:px-[3%]">
          <FilterBar
            chain={+chain}
            pool={selectedPool}
            marketData={marketData}
            onSearch={setFilteredMarketData}
          />

          <CommonTable
            data={filteredMarketData}
            columns={columns}
            isLoading={isLoading}
            getRowStyle={(row) => ({
              badge: row.original.membership
                ? { text: 'Collateral' }
                : undefined,
              borderClassName: row.original.membership
                ? pools[+chain]?.border
                : undefined
            })}
          />
        </div>
      </div>

      {selectedMarketData && poolData && (
        <ManageDialog
          isOpen={isManageDialogOpen}
          setIsOpen={setIsManageDialogOpen}
          isBorrowDisabled={isBorrowDisabled}
          comptrollerAddress={poolData.comptroller}
          selectedMarketData={selectedMarketData}
        />
      )}

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
