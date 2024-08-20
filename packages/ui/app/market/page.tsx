/* eslint-disable @next/next/no-img-element */
'use client';

// import { Listbox, Transition } from '@headlessui/react';
// import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

import { type FlywheelReward } from '@ionicprotocol/types';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type Address, formatEther, formatUnits } from 'viem';
import { fraxtal, mode } from 'viem/chains';
import { useChainId } from 'wagmi';

// import Dropdown from '../_components/Dropdown';
// import NetworkSelector from '../_components/markets/NetworkSelector';
import PoolRows from '../_components/markets/PoolRows';
import type { PopupMode } from '../_components/popup/page';
import Popup from '../_components/popup/page';
import Swap from '../_components/popup/Swap';
import ResultHandler from '../_components/ResultHandler';

import { pools } from '@ui/constants/index';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';
import { useRewards } from '@ui/hooks/useRewards';
import { useSupplyAPYs } from '@ui/hooks/useSupplyAPYs';
import type { MarketData } from '@ui/types/TokensDataMap';
import { sendIMG } from '@ui/utils/TempImgSender';

const SwapWidget = dynamic(() => import('../_components/markets/SwapWidget'), {
  ssr: false
});
const NetworkSelector = dynamic(
  () => import('../_components/markets/NetworkSelector'),
  {
    ssr: false
  }
);
export default function Market() {
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const pool = searchParams.get('pool');
  const [swapOpen, setSwapOpen] = useState<boolean>(false);
  const [swapWidgetOpen, setSwapWidgetOpen] = useState<boolean>(false);
  const [dropdownSelectedChain, setDropdownSelectedChain] = useState<number>(
    mode.id
  );
  const [open, setOpen] = useState<boolean>(false);
  const [popupMode, setPopupMode] = useState<PopupMode>();
  const chainId = useChainId();
  const [selectedPool, setSelectedPool] = useState(
    pool ? pool : pools[mode.id].pools[0].id
  );

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
    poolData?.assets.map((asset) => asset.cToken) ?? []
  );

  const newRef = useRef(null!);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleOutsideClick = (e: any) => {
    //@ts-ignore
    if (newRef.current && !newRef.current?.contains(e?.target)) {
      setOpen(false);
    }
  };

  const { data: rewards } = useRewards({
    chainId: dropdownSelectedChain,
    poolId: selectedPool
  });

  // const networkOptionstest = [
  //   {
  //     chain: mode.id,
  //     name: 'Mode'
  //   },
  //   {
  //     chain: base.id,
  //     name: 'Base'
  //   }
  // ];

  return (
    <>
      <div className="w-full  flex flex-col items-center justify-start transition-all duration-200 ease-linear">
        <div
          className={`w-full flex flex-col items-start pb-6 pt-4 justify-start bg-grayone h-min lg:px-[1%] xl:px-[3%] rounded-xl`}
        >
          <div className={`w-full sm:w-[40%] md:w-[20%] mb-2 `}>
            {' '}
            <NetworkSelector
              chainId={chain as string}
              dropdownSelectedChain={dropdownSelectedChain}
              newRef={newRef}
              open={open}
              // options={networkOptionstest}
              setOpen={setOpen}
            />
          </div>
          <div className="flex md:flex-row flex-col mb-4 w-full md:gap-2 gap-y-2">
            {Object.entries(pools)
              .filter(
                ([chainId]) => chainId === dropdownSelectedChain.toString()
              )
              .map(([, chainData], chainIdx) =>
                chainData.pools.map((pool, poolIdx) => (
                  <Link
                    key={`${chainIdx}-${poolIdx}`}
                    className={`flex flex-col cursor-pointer py-2 md:px-4 ${
                      selectedPool === pool.id
                        ? 'rounded-md border-2 ' + chainData.border
                        : 'rounded-md border-stone-700 border-2'
                    }`}
                    onClick={() => setSelectedPool(pool.id)}
                    href={`/market?chain=${chain}&pool=${pool.id}`}
                  >
                    <div
                      className={`flex items-center justify-center gap-2 py-3 pt-2 pr-2 pl-2 mr-8`}
                    >
                      <img
                        alt="modlogo"
                        className={`md:w-8 w-6`}
                        src={chainData.logo}
                      />
                      <h1 className={`font-semibold`}>{pool.name}</h1>
                    </div>
                    <div className="h-[2px] w-[60%] md:hidden block mx-auto bg-white/10 mb-3" />
                    <div className="flex items-center justify-center pb-2">
                      {pool.assets.map((val, idx) => (
                        <img
                          alt="modlogo"
                          className={`w-6 h-6`}
                          key={idx}
                          src={sendIMG(pool.id, chain, val)}
                        />
                      ))}
                    </div>
                  </Link>
                ))
              )}
          </div>

          <div
            className={`w-full flex flex-wrap items-center justify-center md:justify-start gap-4`}
          >
            <ResultHandler
              isLoading={isLoadingPoolData || isLoadingLoopMarkets}
            >
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 md:text-sm text-[11px]`}>
                  Total Market Size
                </p>
                <p className={`font-semibold md:text-base text-sm`}>
                  $
                  {poolData
                    ? (
                        poolData?.totalSuppliedFiat +
                        poolData?.totalBorrowedFiat
                      ).toLocaleString('en-US', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2
                      })
                    : '0'}
                </p>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center gap-y-1`}
              >
                <p className={`text-white/60  md:text-sm text-[11px]`}>
                  Total Available
                </p>
                <p className={`font-semibold md:text-base text-sm`}>
                  $
                  {poolData?.totalSuppliedFiat.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  }) ?? '0'}
                </p>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center gap-y-1`}
              >
                <p className={`text-white/60 md:text-sm text-[11px]`}>
                  Total Borrows
                </p>
                <p className={`font-semibold md:text-base text-sm`}>
                  $
                  {poolData?.totalBorrowedFiat.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  }) ?? '0'}
                </p>
                {/* this neeeds to be changed */}
              </div>
            </ResultHandler>
          </div>

          <div className="w-full flex flex-row gap-x-2">
            <button
              className={`px-6 mt-4 mx-auto md:mx-0 rounded-md py-1 transition-colors bg-accent text-darkone text-sm font-bold uppercase`}
              onClick={() => setSwapOpen(true)}
            >
              {`Wrap ${dropdownSelectedChain === fraxtal.id ? 'frxETH' : 'ETH'} `}

              <img
                alt=""
                className="inline-block"
                height="20"
                src={`/img/symbols/32/color/${dropdownSelectedChain === fraxtal.id ? 'frxeth' : 'eth'}.png`}
                width="20"
              />
              <span>{' -> '}</span>
              <img
                alt=""
                className="inline-block"
                height="20"
                src={`/img/symbols/32/color/${dropdownSelectedChain === fraxtal.id ? 'wfrxeth' : 'weth'}.png`}
                width="20"
              />
            </button>

            <button
              className={`px-6 mt-4 mx-auto md:mx-0 rounded-md py-1 transition-colors bg-accent text-darkone text-sm font-bold uppercase`}
              onClick={() => setSwapWidgetOpen(true)}
            >
              {'Swap Assets'}
            </button>

            <SwapWidget
              close={() => setSwapWidgetOpen(false)}
              open={swapWidgetOpen}
              toChain={+chain}
            />
          </div>
        </div>
        <div
          className={`bg-grayone w-full lg:px-[1%] xl:px-[3%] mt-3 rounded-xl pt-3 pb-7`}
        >
          {/* <div className={` w-full flex items-center justify-between py-3 `}> */}
          {/* <h1 className={`font-semibold`}>Mode Lending & Borrowing</h1> */}
          {/* <div
              className={` min-w-[30%] flex gap-x-2  items-center justify-center `}
            >
              <img
                src="/img/assets/search.png"
                alt="searchico"
                className={`h-4`}
              />
              <input
                type="text"
                name=""
                id=""
                placeholder="Search by asset name, symbol or address"
                className={
                  ' w-full focus:outline-none placeholder:text-xs  bg-grayone border-r px-2 border-white/20'
                }
              />
              <div
                className={`flex w-[30%] flex-nowrap items-center justify-center text-xs px-2`}
              >
                <p className="w-full truncate flex-nowrap">Sort By</p>
                <img
                  src="/img/assets/downarr.png"
                  alt="downarr"
                  className={`w-4`}
                />
              </div>
            </div> */}
          {/* </div> */}
          {/* <PoolToggle /> */}
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
                    if (!val) return <>/</>;
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
                        } ${
                          val.underlyingSymbol
                        } / $${val.borrowBalanceFiat.toLocaleString('en-US', {
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
                        logo={sendIMG(
                          selectedPool,
                          chain,
                          val.underlyingSymbol
                        )}
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
                        } ${
                          val.underlyingSymbol
                        } / $${val.supplyBalanceFiat.toLocaleString('en-US', {
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
                        } ${
                          val.underlyingSymbol
                        } / $${val.totalBorrowFiat.toLocaleString('en-US', {
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
                        } ${
                          val.underlyingSymbol
                        } / $${val.totalSupplyFiat.toLocaleString('en-US', {
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
