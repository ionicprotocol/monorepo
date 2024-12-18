'use client';

import { useEffect, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import type { MarketRowData } from '@ui/hooks/market/useMarketData';
import { useMarketData } from '@ui/hooks/market/useMarketData';
import type { VaultRowData } from '@ui/hooks/market/useSupplyVaultsData';
import { useSupplyVaultsData } from '@ui/hooks/market/useSupplyVaultsData';

import Loop from '../_components/dialogs/loop';
import ManageDialog from '../_components/dialogs/manage';
import Swap from '../_components/dialogs/manage/Swap';
import FeaturedMarketTile from '../_components/markets/FeaturedMarketTile';
import PoolsTable from '../_components/markets/PoolsTable';
import StakingTile from '../_components/markets/StakingTile';
import SupplyVaultTable from '../_components/markets/SupplyVaultTable';
import TotalTvlTile from '../_components/markets/TotalTvlTile';
import TvlTile from '../_components/markets/TvlTile';
import SupplyVaultDialog from '../_components/dialogs/SupplyVault';
import PoolToggle from '../_components/markets/PoolToggle';
import { isAddress } from 'viem';
import SearchInput from '../_components/markets/SearcInput';

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
  const [isSupplyVaultDialogOpen, setIsSupplyVaultDialogOpen] =
    useState<boolean>(false);

  const [selectedVaultData, setSelectedVaultData] = useState<VaultRowData>();
  const [isLoopDialogOpen, setIsLoopDialogOpen] = useState<boolean>(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>();
  const [isBorrowDisabled, setIsBorrowDisabled] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState('');

  const { vaultData, isLoading: isLoadingVaults } = useSupplyVaultsData(chain);
  const {
    marketData,
    selectedMarketData,
    featuredMarkets,
    isLoading,
    poolData,
    loopProps
  } = useMarketData(selectedPool, chain, selectedSymbol);

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return selectedPool === 'vault' ? vaultData : marketData;
    }

    const isAddressSearch = isAddress(term);
    const data = selectedPool === 'vault' ? vaultData : marketData;

    return data.filter((item) => {
      if (isAddressSearch) {
        if (selectedPool === 'vault') {
          const vault = item as VaultRowData;
          return (
            vault.vaultAddress.toLowerCase() === term ||
            vault.underlyingToken.toLowerCase() === term ||
            vault.cToken.toLowerCase() === term
          );
        } else {
          const market = item as MarketRowData;
          return (
            market.cTokenAddress.toLowerCase() === term ||
            market.underlyingToken.toLowerCase() === term
          );
        }
      }

      if (selectedPool === 'vault') {
        const vault = item as VaultRowData;
        return (
          vault.asset.toLowerCase().includes(term) ||
          vault.underlyingSymbol.toLowerCase().includes(term) ||
          vault.strategy.description.toLowerCase().includes(term) ||
          vault.strategy.distribution.some((d) =>
            d.poolName.toLowerCase().includes(term)
          )
        );
      } else {
        const market = item as MarketRowData;
        return (
          market.asset.toLowerCase().includes(term) ||
          market.underlyingSymbol.toLowerCase().includes(term)
        );
      }
    });
  }, [searchTerm, selectedPool, vaultData, marketData]);

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
          <div className="w-full flex flex-col sm:flex-row sm:items-center gap-4 pr-3.5">
            <div className="flex justify-center sm:justify-end sm:flex-shrink-0">
              <PoolToggle
                chain={+chain}
                pool={selectedPool}
              />
            </div>
            <div className="w-full">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={`Search by ${
                  selectedPool === 'vault'
                    ? 'vault name, token, or strategy'
                    : 'token or address'
                }...`}
              />
            </div>
          </div>

          {selectedPool === 'vault' ? (
            <SupplyVaultTable
              marketData={filteredData as VaultRowData[]}
              isLoading={isLoadingVaults}
              setIsManageDialogOpen={setIsManageDialogOpen}
              setSelectedVaultData={setSelectedVaultData}
            />
          ) : (
            <PoolsTable
              marketData={filteredData as MarketRowData[]}
              isLoading={isLoading}
              setIsManageDialogOpen={setIsManageDialogOpen}
              setIsLoopDialogOpen={setIsLoopDialogOpen}
              setIsBorrowDisabled={setIsBorrowDisabled}
              setSelectedSymbol={setSelectedSymbol}
            />
          )}
        </div>
      </div>

      {selectedVaultData && (
        <SupplyVaultDialog
          isOpen={isSupplyVaultDialogOpen}
          setIsOpen={setIsSupplyVaultDialogOpen}
          selectedVaultData={selectedVaultData}
          chainId={chainId}
        />
      )}

      {poolData?.comptroller && selectedMarketData && (
        <ManageDialog
          isOpen={isManageDialogOpen}
          setIsOpen={setIsManageDialogOpen}
          isBorrowDisabled={isBorrowDisabled}
          comptrollerAddress={poolData?.comptroller}
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
