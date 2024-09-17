/* eslint-disable @next/next/no-img-element */
'use client';

// import { Listbox, Transition } from '@headlessui/react';
// import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

import { type FlywheelReward } from '@ionicprotocol/types';
import dynamic from 'next/dynamic';
// import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { type Address, formatEther, formatUnits } from 'viem';
import { mode } from 'viem/chains';
import { useChainId } from 'wagmi';

// import Dropdown from '../_components/Dropdown';
// import NetworkSelector from '../_components/markets/NetworkSelector';
import FeaturedMarketTile from '../_components/markets/FeaturedMarketTile';
import PoolRows from '../_components/markets/PoolRows';
import StakingTile from '../_components/markets/StakingTile';
import TotalTvlTile from '../_components/markets/TotalTvlTile';
import TvlTile from '../_components/markets/TvlTile';
import type { PopupMode } from '../_components/popup/page';
import Popup from '../_components/popup/page';
import Swap from '../_components/popup/Swap';
import ResultHandler from '../_components/ResultHandler';
import { getAssetName } from '../util/utils';
const PoolToggle = dynamic(() => import('../_components/markets/PoolToggle'), {
  ssr: false
});

import { pools } from '@ui/constants/index';
// import { useAllTvlAcrossChain } from '@ui/hooks/useAllTvlAcrossChain';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';
import { useRewards } from '@ui/hooks/useRewards';
import { useSupplyAPYs } from '@ui/hooks/useSupplyAPYs';
import type { MarketData } from '@ui/types/TokensDataMap';
// import SwapWidget from '../_components/markets/SwapWidget';

const NetworkSelector = dynamic(
  () => import('../_components/markets/NetworkSelector'),
  { ssr: false }
);

export default function Market() {
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const querypool = searchParams.get('pool');
  const [swapOpen, setSwapOpen] = useState<boolean>(false);
  const [swapWidgetOpen, setSwapWidgetOpen] = useState<boolean>(false);
  const [dropdownSelectedChain, setDropdownSelectedChain] = useState<number>(
    mode.id
  );

  const [popupMode, setPopupMode] = useState<PopupMode>();
  const chainId = useChainId();

  const selectedPool = querypool ?? '0';
  const chain = querychain ? querychain : mode.id;
  const { data: poolData, isLoading: isLoadingPoolData } = useFusePoolData(
    selectedPool,
    +chain
  );

  useEffect(() => {
    if (!chain) return;
    setDropdownSelectedChain(+chain);
  }, [chain]);

  const assets = useMemo<MarketData[] | undefined>(
    () => poolData?.assets,
    [poolData]
  );

  const { data: borrowRates } = useBorrowAPYs(
    assets ?? [],
    dropdownSelectedChain
  );

  const { data: supplyRates } = useSupplyAPYs(
    assets ?? [],
    dropdownSelectedChain
  );

  const [selectedSymbol, setSelectedSymbol] = useState<string>();
  const selectedMarketData = useMemo<MarketData | undefined>(
    () =>
      poolData?.assets.find(
        (_asset) => _asset.underlyingSymbol === selectedSymbol
      ),
    [selectedSymbol, poolData]
  );
  const { data: loopMarkets, isLoading: isLoadingLoopMarkets } = useLoopMarkets(
    poolData?.assets.map((asset) => asset.cToken) ?? [],
    +chain
  );

  const { data: rewards } = useRewards({
    chainId: dropdownSelectedChain,
    poolId: selectedPool
  });

  // const { data: alltvl } = useAllTvlAcrossChain();
  // console.log(alltvl);
  return (
    <>
      <div className="w-full  flex flex-col items-center justify-start transition-all duration-200 ease-linear">
        {/* //........ */}
        <div
          className={`w-full grid lg:grid-cols-9 md:grid-cols-8  grid-cols-1 flex-col items-start  justify-start bg-darkone h-min rounded-xl gap-2 `}
        >
          <div className={`grid gap-y-2 col-span-3  h-full`}>
            <TotalTvlTile />
            <TvlTile
              dropdownSelectedChain={dropdownSelectedChain.toString()}
              poolData={poolData!}
              isLoadingPoolData={isLoadingPoolData}
              isLoadingLoopMarkets={isLoadingLoopMarkets}
              selectedPool={selectedPool}
            />
          </div>
          <FeaturedMarketTile
            setPopupMode={setPopupMode}
            setSelectedSymbol={setSelectedSymbol}
            selectedChain={chainId}
            isLoadingPoolData={isLoadingPoolData}
            setSwapWidgetOpen={setSwapWidgetOpen}
            swapWidgetOpen={swapWidgetOpen}
            dropdownSelectedChain={dropdownSelectedChain.toString()}
          />
          <StakingTile chain={+chain} />
        </div>
        {/* //............................................ */}
        <div className={`w-full my-3 flex flex-wrap  `}>
          <NetworkSelector
            dropdownSelectedChain={+chain}
            upcomingChains={['MetalL2', 'Lisk', 'Ozean', 'Soneium']}
          />
        </div>
        <div
          className={`bg-grayone w-full lg:px-[1%] xl:px-[3%]  rounded-xl pt-3 pb-7`}
        >
          <div className={`w-full flex-wrap flex justify-between items-center`}>
            <PoolToggle
              chain={+chain}
              pool={selectedPool}
            />
          </div>
          <div
            className={`w-full gap-x-1 hidden md:grid  grid-cols-20 items-start py-4 text-[10px] text-white/40 font-semibold text-center px-2 `}
          >
            <h3 className={` col-span-2`}>ASSETS</h3>
            <h3 className={` col-span-2`}>SUPPLY BALANCE</h3>
            <h3 className={` col-span-2`}>TOTAL SUPPLIED</h3>
            <h3 className={` col-span-2`}>BORROW BALANCE</h3>
            <h3 className={` col-span-2`}>TOTAL BORROWED</h3>
            <h3 className={` col-span-2`}>SUPPLY APR</h3>
            <h3 className={` col-span-2`}>BORROW APR</h3>
            <h3 className={` col-span-2`}>COLLATERAL FACTOR</h3>
            <h3 className={` col-span-4`}>SUPPLY/BORROW</h3>
          </div>
          <ResultHandler
            center
            isLoading={isLoadingPoolData}
          >
            <>
              {assets &&
                pools[dropdownSelectedChain].pools[+selectedPool].assets.map(
                  (symbol: string, idx: number) => {
                    const val = assets.find(
                      (asset) => asset.underlyingSymbol === symbol
                    );
                    if (!val) return <></>;
                    return (
                      <PoolRows
                        asset={val.underlyingSymbol}
                        borrowAPR={
                          typeof borrowRates?.[val.cToken] !== 'undefined'
                            ? borrowRates?.[val.cToken] * 100
                            : undefined
                        }
                        borrowBalance={`${
                          typeof val.borrowBalance === 'bigint'
                            ? parseFloat(
                                formatUnits(
                                  val.borrowBalance,
                                  val.underlyingDecimals
                                )
                              ).toLocaleString('en-US', {
                                maximumFractionDigits: 2
                              })
                            : '-'
                        } ${getAssetName(
                          val.underlyingSymbol,
                          dropdownSelectedChain
                        )} / $${val.borrowBalanceFiat.toLocaleString('en-US', {
                          maximumFractionDigits: 2
                        })}`}
                        chain={chain.toString()}
                        collateralFactor={
                          (val
                            ? Number(formatEther(val.collateralFactor))
                            : 0) * 100
                        }
                        cTokenAddress={val.cToken}
                        comptrollerAddress={
                          poolData?.comptroller || ('' as Address)
                        }
                        dropdownSelectedChain={dropdownSelectedChain}
                        key={idx}
                        logo={`/img/symbols/32/color/${val.underlyingSymbol.toLowerCase()}.png`}
                        loopPossible={
                          loopMarkets
                            ? loopMarkets[val.cToken].length > 0
                            : false
                        }
                        membership={val?.membership ?? false}
                        pool={selectedPool}
                        rewards={
                          (rewards?.[val?.cToken]?.map((r) => ({
                            ...r,
                            apy:
                              typeof r.apy !== 'undefined'
                                ? r.apy * 100
                                : undefined
                          })) as FlywheelReward[]) ?? []
                        }
                        selectedChain={chainId}
                        selectedMarketData={selectedMarketData}
                        selectedPoolId={selectedPool}
                        selectedSymbol={selectedSymbol as string}
                        setPopupMode={setPopupMode}
                        setSelectedSymbol={setSelectedSymbol}
                        supplyAPR={
                          typeof supplyRates?.[val.cToken] !== 'undefined'
                            ? supplyRates?.[val.cToken] * 100
                            : undefined
                        }
                        supplyBalance={`${
                          typeof val.supplyBalance === 'bigint'
                            ? parseFloat(
                                formatUnits(
                                  val.supplyBalance,
                                  val.underlyingDecimals
                                )
                              ).toLocaleString('en-US', {
                                maximumFractionDigits: 2
                              })
                            : '-'
                        } ${getAssetName(
                          val.underlyingSymbol,
                          dropdownSelectedChain
                        )} / $${val.supplyBalanceFiat.toLocaleString('en-US', {
                          maximumFractionDigits: 2
                        })}`}
                        totalBorrowing={`${
                          val.totalBorrowNative
                            ? parseFloat(
                                formatUnits(
                                  val.totalBorrow,
                                  val.underlyingDecimals
                                )
                              ).toLocaleString('en-US', {
                                maximumFractionDigits: 2
                              })
                            : '0'
                        } ${getAssetName(
                          val.underlyingSymbol,
                          dropdownSelectedChain
                        )} / $${val.totalBorrowFiat.toLocaleString('en-US', {
                          maximumFractionDigits: 2
                        })}`}
                        totalSupplied={`${
                          val.totalSupplyNative
                            ? parseFloat(
                                formatUnits(
                                  val.totalSupply,
                                  val.underlyingDecimals
                                )
                              ).toLocaleString('en-US', {
                                maximumFractionDigits: 2
                              })
                            : '0'
                        } ${getAssetName(
                          val.underlyingSymbol,
                          dropdownSelectedChain
                        )} / $${val.totalSupplyFiat.toLocaleString('en-US', {
                          maximumFractionDigits: 2
                        })}`}
                      />
                    );
                  }
                )}
            </>
          </ResultHandler>
        </div>
      </div>
      {popupMode && selectedMarketData && poolData && (
        <Popup
          closePopup={() => setPopupMode(undefined)}
          comptrollerAddress={poolData.comptroller}
          loopMarkets={loopMarkets}
          mode={popupMode}
          selectedMarketData={selectedMarketData}
        />
      )}

      {swapOpen && (
        <Swap
          close={() => setSwapOpen(false)}
          dropdownSelectedChain={dropdownSelectedChain}
          selectedChain={chainId}
        />
      )}
    </>
  );
}
