// Market.tsx
'use client';

import { useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import type { MarketRowData } from '@ui/hooks/market/useMarketData';
import { useMarketData } from '@ui/hooks/market/useMarketData';
import type { LoopMarketData } from '@ui/hooks/useLoopMarkets';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import CommonTable from '../_components/CommonTable';
import ManageDialog, { PopupMode } from '../_components/manage-dialog';
import Loop from '../_components/manage-dialog/Loop';
import Swap from '../_components/manage-dialog/Swap';
import APRCell from '../_components/markets/APRCell';
import FeaturedMarketTile from '../_components/markets/FeaturedMarketTile';
import StakingTile from '../_components/markets/StakingTile';
import TotalTvlTile from '../_components/markets/TotalTvlTile';
import TvlTile from '../_components/markets/TvlTile';

import type { EnhancedColumnDef } from '../_components/CommonTable';
import type { Row } from '@tanstack/react-table';

const NetworkSelector = dynamic(
  () => import('../_components/markets/NetworkSelector'),
  { ssr: false }
);

const PoolToggle = dynamic(() => import('../_components/markets/PoolToggle'), {
  ssr: false
});

interface MarketCellProps {
  row: Row<MarketRowData>;
  getValue: () => any;
}

export default function Market() {
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const [swapOpen, setSwapOpen] = useState<boolean>(false);
  const [swapWidgetOpen, setSwapWidgetOpen] = useState<boolean>(false);
  const [wrapWidgetOpen, setWrapWidgetOpen] = useState<boolean>(false);
  const chainId = useChainId();
  const { address } = useMultiIonic();
  const [popupMode, setPopupMode] = useState<PopupMode>();
  const [loopMarkets, setLoopMarkets] = useState<LoopMarketData>();

  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();
  const [selectedSymbol, setSelectedSymbol] = useState<string>();

  const { marketData, isLoading, poolData } = useMarketData(
    selectedPool,
    chain
  );

  const selectedMarketData = marketData.find(
    (asset) => asset.asset === selectedSymbol
  );

  const loopProps = useMemo(() => {
    if (!selectedMarketData || !poolData) return null;
    return {
      borrowableAssets: loopMarkets
        ? loopMarkets[selectedMarketData.cToken]
        : [],
      comptrollerAddress: poolData.comptroller,
      selectedCollateralAsset: selectedMarketData
    };
  }, [selectedMarketData, poolData, loopMarkets]);

  const columns: EnhancedColumnDef<MarketRowData>[] = [
    {
      id: 'asset',
      header: 'ASSETS',
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
          className="flex items-center gap-2"
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
      id: 'supplyAPRTotal',
      header: 'SUPPLY APR',
      sortingFn: 'numerical',
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
        <span className="text-right">{row.original.supplyBalance}</span>
      )
    },
    {
      id: 'borrowBalance',
      header: 'BORROW BALANCE',
      sortingFn: 'numerical',
      cell: ({ row }: MarketCellProps) => (
        <span className="text-right">{row.original.borrowBalance}</span>
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
        <div className="flex gap-2">
          {!row.original.isBorrowDisabled && (
            <button
              className="rounded-md bg-accent text-black py-1.5 px-4 uppercase truncate disabled:opacity-50"
              onClick={async () => {
                const result = await handleSwitchOriginChain(+chain, chainId);
                if (result) {
                  setSelectedSymbol(row.original.asset);
                  setPopupMode(PopupMode.MANAGE);
                }
              }}
              disabled={!address}
            >
              Manage
            </button>
          )}
          {row.original.loopPossible && (
            <button
              className="rounded-md bg-white/10 text-white py-1.5 px-4 uppercase truncate disabled:opacity-50 hover:bg-white/20"
              onClick={async () => {
                const result = await handleSwitchOriginChain(+chain, chainId);
                if (result) {
                  setSelectedSymbol(row.original.asset);
                  setPopupMode(PopupMode.LOOP);
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

      {popupMode === PopupMode.MANAGE && selectedMarketData && poolData && (
        <ManageDialog
          closePopup={() => setPopupMode(undefined)}
          comptrollerAddress={poolData.comptroller}
          selectedMarketData={selectedMarketData}
        />
      )}

      {popupMode === PopupMode.LOOP && loopProps && (
        <Loop
          {...loopProps}
          closeLoop={() => setPopupMode(undefined)}
          isOpen={true}
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
