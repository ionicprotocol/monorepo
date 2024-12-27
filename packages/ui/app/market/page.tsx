'use client';

import { useMemo, useState } from 'react';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import { isAddress } from 'viem';
import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import ManageDialog from '@ui/components/dialogs/manage';
import FeaturedMarketTile from '@ui/components/markets/FeaturedMarketTile';
import PoolsTable from '@ui/components/markets/PoolsTable';
import PoolToggle from '@ui/components/markets/PoolToggle';
import SearchInput from '@ui/components/markets/SearcInput';
import StakingTile from '@ui/components/markets/StakingTile';
import SupplyVaultTable from '@ui/components/markets/SupplyVaultTable';
import TotalTvlTile from '@ui/components/markets/TotalTvlTile';
import TvlTile from '@ui/components/markets/TvlTile';
import { useMarketData } from '@ui/hooks/market/useMarketData';
import type { MarketRowData } from '@ui/hooks/market/useMarketData';
import { useSupplyVaultsData } from '@ui/hooks/market/useSupplyVaultsData';
import { useAssetPrices } from '@ui/hooks/useAssetPrices';
import type { VaultRowData } from '@ui/types/SupplyVaults';

const NetworkSelector = dynamic(
  () => import('@ui/components/markets/NetworkSelector'),
  { ssr: false }
);

export default function Market() {
  const searchParams = useSearchParams();
  const chainId = useChainId();

  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id.toString();
  // console.log('chain', chain);

  // const { data } = useAssetPrices({
  //   chainId: +chain
  // });
  // console.log('data', data);

  console.log('render');

  const [isManageDialogOpen, setIsManageDialogOpen] = useState<boolean>(false);

  const [selectedSymbol, setSelectedSymbol] = useState<string>();
  const [isBorrowDisabled, setIsBorrowDisabled] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState('');

  const { vaultData, isLoading: isLoadingVaults } = useSupplyVaultsData(chain);
  const {
    marketData,
    selectedMarketData,
    featuredMarkets,
    isLoading,
    poolData
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
              vaultData={{
                totalSuppliedFiat: vaultData.reduce(
                  (acc, v) => acc + v.totalSupply.usd,
                  0
                )
              }}
              isLoadingVaults={isLoadingVaults}
            />
          </div>
          <FeaturedMarketTile
            isLoadingPoolData={isLoading}
            dropdownSelectedChain={chain}
            selectedChain={chainId}
            setSelectedSymbol={setSelectedSymbol}
            setIsManageDialogOpen={setIsManageDialogOpen}
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
            />
          ) : (
            <PoolsTable
              marketData={filteredData as MarketRowData[]}
              isLoading={isLoading}
              setIsManageDialogOpen={setIsManageDialogOpen}
              setIsBorrowDisabled={setIsBorrowDisabled}
              setSelectedSymbol={setSelectedSymbol}
              selectedSymbol={selectedSymbol}
            />
          )}
        </div>
      </div>

      {poolData?.comptroller && selectedMarketData && (
        <ManageDialog
          isOpen={isManageDialogOpen}
          setIsOpen={setIsManageDialogOpen}
          isBorrowDisabled={isBorrowDisabled}
          comptrollerAddress={poolData?.comptroller}
          selectedMarketData={selectedMarketData}
        />
      )}
    </>
  );
}
