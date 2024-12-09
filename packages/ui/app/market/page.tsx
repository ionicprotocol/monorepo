'use client';

import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import type { MarketRowData } from '@ui/hooks/market/useMarketData';
import { useMarketData } from '@ui/hooks/market/useMarketData';
import type { VaultRowData } from '@ui/hooks/market/useSupplyVaults';
import { useSupplyVaults } from '@ui/hooks/market/useSupplyVaults';

import Loop from '../_components/dialogs/loop';
import ManageDialog from '../_components/dialogs/manage';
import Swap from '../_components/dialogs/manage/Swap';
import FeaturedMarketTile from '../_components/markets/FeaturedMarketTile';
import FilterBar from '../_components/markets/FilterBar';
import PoolsTable from '../_components/markets/PoolsTable';
import StakingTile from '../_components/markets/StakingTile';
import SupplyVaultTable from '../_components/markets/SupplyVaultTable';
import TotalTvlTile from '../_components/markets/TotalTvlTile';
import TvlTile from '../_components/markets/TvlTile';
import SupplyVaultDialog from '../_components/dialogs/SupplyVault';

const NetworkSelector = dynamic(
  () => import('../_components/markets/NetworkSelector'),
  { ssr: false }
);

export default function Market() {
  const searchParams = useSearchParams();
  const chainId = useChainId();

  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();

  const [swapOpen, setSwapOpen] = useState<boolean>(false);
  const [swapWidgetOpen, setSwapWidgetOpen] = useState<boolean>(false);
  const [wrapWidgetOpen, setWrapWidgetOpen] = useState<boolean>(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState<boolean>(false);
  const [selectedVaultData, setSelectedVaultData] = useState<VaultRowData>();
  const [isLoopDialogOpen, setIsLoopDialogOpen] = useState<boolean>(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>();
  const [isBorrowDisabled, setIsBorrowDisabled] = useState<boolean>(false);
  const [filteredMarketData, setFilteredMarketData] = useState<MarketRowData[]>(
    []
  );

  const { marketData, isLoading, poolData, selectedMarketData, loopProps } =
    useMarketData(selectedPool, chain, selectedSymbol);
  const { vaultData, isLoading: isLoadingVaults } = useSupplyVaults(chain);

  useEffect(() => {
    setFilteredMarketData(marketData);
  }, [marketData]);

  useEffect(() => {
    if (selectedPool === 'vault' && selectedSymbol && vaultData.length > 0) {
      const vault = vaultData.find((v) => v.asset === selectedSymbol);
      if (vault) {
        setSelectedVaultData((prev) => {
          if (prev?.vaultAddress !== vault.vaultAddress) {
            return vault;
          }
          return prev;
        });
      }
    } else {
      setSelectedVaultData(undefined);
    }
  }, [selectedSymbol, selectedPool, vaultData]);

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
        <div className="bg-grayone w-full rounded-xl py-4 px-4 lg:px-[1%] xl:px-[3%]">
          <FilterBar
            chain={+chain}
            pool={selectedPool}
            marketData={marketData}
            onSearch={setFilteredMarketData}
          />

          {selectedPool === 'vault' ? (
            <SupplyVaultTable
              marketData={vaultData}
              isLoading={isLoadingVaults}
              setIsManageDialogOpen={setIsManageDialogOpen}
              setSelectedSymbol={setSelectedSymbol}
            />
          ) : (
            <PoolsTable
              marketData={filteredMarketData}
              isLoading={isLoading}
              setIsManageDialogOpen={setIsManageDialogOpen}
              setIsLoopDialogOpen={setIsLoopDialogOpen}
              setIsBorrowDisabled={setIsBorrowDisabled}
              setSelectedSymbol={setSelectedSymbol}
            />
          )}
        </div>
      </div>

      {selectedPool === 'vault'
        ? selectedVaultData && (
            <SupplyVaultDialog
              isOpen={isManageDialogOpen}
              setIsOpen={setIsManageDialogOpen}
              selectedVaultData={selectedVaultData}
              chainId={chainId}
            />
          )
        : selectedMarketData &&
          poolData && (
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
