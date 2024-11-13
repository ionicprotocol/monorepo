// Market.tsx
'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { type ColumnDef } from '@tanstack/react-table';
import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import { pools } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketRowData } from '@ui/hooks/market/useMarketData';
import { useMarketData } from '@ui/hooks/market/useMarketData';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import CommonTable from '../_components/CommonTable';
import APRCell from '../_components/markets/APRCell';
import FeaturedMarketTile from '../_components/markets/FeaturedMarketTile';
import StakingTile from '../_components/markets/StakingTile';
import TotalTvlTile from '../_components/markets/TotalTvlTile';
import TvlTile from '../_components/markets/TvlTile';
import Popup, { PopupMode } from '../_components/popup/page';
import Swap from '../_components/popup/Swap';

const NetworkSelector = dynamic(
  () => import('../_components/markets/NetworkSelector'),
  { ssr: false }
);

const PoolToggle = dynamic(() => import('../_components/markets/PoolToggle'), {
  ssr: false
});

export default function Market() {
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const [swapOpen, setSwapOpen] = useState<boolean>(false);
  const [swapWidgetOpen, setSwapWidgetOpen] = useState<boolean>(false);
  const [wrapWidgetOpen, setWrapWidgetOpen] = useState<boolean>(false);
  const [popupMode, setPopupMode] = useState<PopupMode>();
  const chainId = useChainId();
  const { address } = useMultiIonic();

  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();
  const [selectedSymbol, setSelectedSymbol] = useState<string>();

  const { marketData, isLoading, poolData } = useMarketData(
    selectedPool,
    chain
  );

  const columns: ColumnDef<MarketRowData>[] = [
    {
      accessorKey: 'asset',
      header: 'ASSETS',
      cell: ({ row }) => (
        <Link
          href={{
            pathname: `/market/details/${row.original.asset}`,
            query: {
              chain,
              comptrollerAddress: row.original.comptrollerAddress,
              cTokenAddress: row.original.cTokenAddress,
              dropdownSelectedChain: chain,
              pool: selectedPool,
              borrowAPR: row.original.borrowAPR ?? '-',
              supplyAPR: row.original.supplyAPR ?? '-',
              selectedChain: chainId,
              selectedSymbol: row.original.asset
            }
          }}
          className="flex items-center gap-2"
        >
          <img
            src={row.original.logo}
            alt={row.original.asset}
            className="w-7 h-7"
          />
          <span className="text-sm">{row.original.asset}</span>
        </Link>
      )
    },
    {
      accessorKey: 'supplyBalance',
      header: 'SUPPLY BALANCE',
      cell: ({ row }) => (
        <span className="text-right">{row.original.supplyBalance}</span>
      )
    },
    {
      accessorKey: 'totalSupplied',
      header: 'TOTAL SUPPLIED',
      cell: ({ row }) => (
        <span className="text-right">{row.original.totalSupplied}</span>
      )
    },
    {
      accessorKey: 'borrowBalance',
      header: 'BORROW BALANCE',
      cell: ({ row }) => (
        <span className="text-right">{row.original.borrowBalance}</span>
      )
    },
    {
      accessorKey: 'totalBorrowing',
      header: 'TOTAL BORROWED',
      cell: ({ row }) => (
        <span className="text-right">{row.original.totalBorrowing}</span>
      )
    },
    {
      accessorKey: 'supplyAPRTotal',
      header: 'SUPPLY APR',
      cell: ({ row }) => (
        <APRCell
          type="supply"
          aprTotal={row.original.supplyAPRTotal}
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
      accessorKey: 'borrowAPRTotal',
      header: 'BORROW APR',
      cell: ({ row }) => (
        <APRCell
          type="borrow"
          aprTotal={row.original.borrowAPRTotal}
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
      accessorKey: 'collateralFactor',
      header: 'COLLATERAL FACTOR',
      cell: ({ row }) => <span>{row.original.collateralFactor}%</span>
    },
    {
      id: 'actions',
      header: 'SUPPLY/BORROW',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <button
            className="rounded-md bg-accent disabled:opacity-50 text-black py-1.5 px-1 uppercase truncate"
            onClick={async () => {
              const result = await handleSwitchOriginChain(+chain, chainId);
              if (result) {
                setSelectedSymbol(row.original.asset);
                setPopupMode(PopupMode.SUPPLY);
              }
            }}
            disabled={!address}
          >
            Supply / Withdraw
          </button>
          <button
            className={`rounded-md ${pools[+chain].bg} ${
              pools[+chain].text
            } disabled:opacity-50 py-1.5 px-1 uppercase truncate`}
            onClick={async () => {
              const result = await handleSwitchOriginChain(+chain, chainId);
              if (result) {
                setSelectedSymbol(row.original.asset);
                setPopupMode(PopupMode.BORROW);
              }
            }}
            disabled={
              (!address || row.original.isBorrowDisabled) &&
              !row.original.loopPossible
            }
          >
            {row.original.isBorrowDisabled && row.original.loopPossible
              ? 'Loop'
              : `Borrow / Repay${row.original.loopPossible ? ' / Loop' : ''}`}
          </button>
        </div>
      )
    }
  ];

  const selectedMarketData = marketData.find(
    (asset) => asset.asset === selectedSymbol
  );

  return (
    <>
      <div className="w-full flex flex-col items-center justify-start transition-all duration-200 ease-linear">
        <div className="w-full grid lg:grid-cols-9 md:grid-cols-8 grid-cols-1 flex-col items-start justify-start bg-darkone h-min rounded-xl gap-2">
          <div className="grid gap-y-2 col-span-3 h-full">
            <TotalTvlTile />
            <TvlTile
              dropdownSelectedChain={chain}
              poolData={poolData!}
              isLoadingPoolData={isLoading}
              isLoadingLoopMarkets={false}
              selectedPool={selectedPool}
            />
          </div>
          <FeaturedMarketTile
            setPopupMode={setPopupMode}
            setSelectedSymbol={setSelectedSymbol}
            selectedChain={chainId}
            isLoadingPoolData={isLoading}
            setSwapWidgetOpen={setSwapWidgetOpen}
            swapWidgetOpen={swapWidgetOpen}
            dropdownSelectedChain={chain}
            setWrapWidgetOpen={setWrapWidgetOpen}
            wrapWidgetOpen={wrapWidgetOpen}
          />
          <StakingTile chain={+chain} />
        </div>

        <div className="w-full my-4 flex flex-wrap">
          <NetworkSelector
            dropdownSelectedChain={+chain}
            upcomingChains={[
              'MetalL2',
              'Ozean',
              'Soneium',
              'Camp',
              'FX',
              'Ink',
              'Kroma',
              'Unichain',
              'Worldchain'
            ]}
          />
        </div>

        <div className="bg-grayone w-full lg:px-[1%] xl:px-[3%] rounded-xl pt-3 pb-7">
          <div className="w-full flex-wrap flex justify-between items-center">
            <PoolToggle
              chain={+chain}
              pool={selectedPool}
            />
          </div>

          <CommonTable
            data={marketData}
            columns={columns}
            isLoading={isLoading}
          />
        </div>
      </div>

      {popupMode && selectedMarketData && poolData && (
        <Popup
          closePopup={() => setPopupMode(undefined)}
          comptrollerAddress={poolData.comptroller}
          mode={popupMode}
          selectedMarketData={selectedMarketData}
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
