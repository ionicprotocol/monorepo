/* eslint-disable @next/next/no-img-element */
'use client';

// import { Listbox, Transition } from '@headlessui/react';
// import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { BigNumber } from 'ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils.js';
import { useEffect, useMemo, useState } from 'react';
// import { base, mode } from 'viem/chains';
import { useChainId } from 'wagmi';

import PoolRows from '../_components/markets/PoolRows';
import type { PopupMode } from '../_components/popup/page';
import Popup from '../_components/popup/page';
import Swap from '../_components/popup/Swap';
import ResultHandler from '../_components/ResultHandler';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';
import type { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

const pools = [
  {
    id: '0',
    name: 'Mode - Main Market'
  },
  {
    id: '1',
    name: 'Mode - Native Market'
  },
  {
    id: '0',
    name: 'Base Market'
  }
];

export default function Market() {
  const [swapOpen, setSwapOpen] = useState<boolean>(false);
  const { currentSdk } = useMultiIonic();
  const [popupMode, setPopupMode] = useState<PopupMode>();
  const chainId = useChainId();
  const [selectedPool, setSelectedPool] = useState(pools[0].id);
  const [selectedTab, setSelectedTab] = useState('');
  const [poolData, setPoolData] = useState<PoolData>();
  const { data: pool1Data, isLoading: isLoadingPool1Data } = useFusePoolData(
    pools[0].id,
    chainId
  );
  const { data: pool2Data, isLoading: isLoadingPool2Data } = useFusePoolData(
    pools[1].id,
    chainId
  );
  const { data: pool3Data, isLoading: isLoadingPool3Data } = useFusePoolData(
    pools[2].id,
    chainId
  );

  //need to add three things 1 change the path to /market 2 add a dropdown filter to see the pool of selected network 3 add a query so that we can directly go to pool if query passed

  useEffect(() => {
    if (selectedPool === pools[0].id && pool1Data) {
      setPoolData(pool1Data);
    } else if (selectedPool === pools[1].id && pool2Data) {
      setPoolData(pool2Data);
    } else if (selectedPool === pools[2].id && pool3Data) {
      setPoolData(pool3Data);
    }
  }, [pool1Data, pool2Data, pool3Data, selectedPool]);

  const assets = useMemo<MarketData[] | undefined>(
    () => poolData?.assets,
    [poolData]
  );
  const dataIsLoading = useMemo<boolean>(
    () => isLoadingPool1Data || isLoadingPool2Data || isLoadingPool3Data,
    [isLoadingPool1Data, isLoadingPool2Data, isLoadingPool3Data]
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

  const selectedPoolClass = 'rounded-md border-mode border-2';

  return (
    <>
      <div className="w-full  flex flex-col items-center justify-start transition-all duration-200 ease-linear">
        <div
          className={`w-full flex flex-col items-start py-4 justify-start bg-grayone h-min px-[3%] rounded-xl`}
        >
          <h1 className={`font-semibold pb-4 text-2xl`}>Select Market</h1>
          <div className="flex md:flex-row flex-col mb-4 w-full md:gap-2 gap-y-2">
            <div
              className={`flex flex-col cursor-pointer  py-2 md:px-4 ${
                selectedPool === pools[0].id && selectedTab === pools[0].name
                  ? selectedPoolClass
                  : 'rounded-md border-stone-700 border-2'
              }`}
              onClick={() => (
                setSelectedPool(pools[0].id), setSelectedTab(pools[0].name)
              )}
            >
              <div
                className={`flex items-center justify-center gap-2 py-3 pt-2 pr-2 pl-2 mr-8`}
              >
                <img
                  alt="modlogo"
                  className={`w-8`}
                  src="/img/logo/MODE.png"
                />
                <h1 className={`font-semibold`}>{pools[0].name}</h1>
              </div>
              <div className="flex items-center justify-center pb-2">
                {pool1Data?.assets.map((val, idx) => (
                  <img
                    alt="modlogo"
                    className={`w-6`}
                    key={idx}
                    src={`/img/symbols/32/color/${val.underlyingSymbol.toLowerCase()}.png`}
                  />
                ))}
              </div>
            </div>

            <div
              className={`flex flex-col cursor-pointer py-2 md:px-4 ${
                selectedPool === pools[1].id
                  ? selectedPoolClass
                  : 'rounded-md border-stone-700 border-2'
              }`}
              onClick={() => (
                setSelectedPool(pools[1].id), setSelectedTab(pools[1].name)
              )}
            >
              <div
                className={`flex items-center justify-center gap-2 py-3 pt-2 pr-2 pl-2 cursor-pointer`}
              >
                <img
                  alt="modlogo"
                  className={`w-8`}
                  src="/img/logo/MODE.png"
                />
                <h1 className={`font-semibold`}>{pools[1].name}</h1>
              </div>
              <div className="flex items-center justify-center pb-2">
                {pool2Data?.assets.map((val, idx) => (
                  <img
                    alt="modlogo"
                    className={`w-6`}
                    key={idx}
                    src={`/img/symbols/32/color/${val.underlyingSymbol.toLowerCase()}.png`}
                  />
                ))}
              </div>
            </div>
            <div
              className={`flex flex-col cursor-pointer py-2 md:px-4 ${
                selectedPool === '0' && selectedTab === 'BASE'
                  ? selectedPoolClass
                  : 'rounded-md border-stone-700 border-2'
              }`}
              onClick={() => (
                setSelectedPool(pools[2].id), setSelectedTab('BASE')
              )}
            >
              <div
                className={`flex items-center justify-center gap-2 py-3 pt-2 pr-2 pl-2 cursor-pointer`}
              >
                <img
                  alt="modlogo"
                  className={`w-8`}
                  src="/img/logo/BASE.png"
                />
                <h1 className={`font-semibold`}>{pools[2].name}</h1>
              </div>
              <div className="flex items-center justify-center pb-2">
                {pool3Data?.assets.map((val, idx) => (
                  <img
                    alt="modlogo"
                    className={`w-6`}
                    key={idx}
                    src={`/img/symbols/32/color/${val.underlyingSymbol.toLowerCase()}.png`}
                  />
                ))}
              </div>
            </div>
          </div>

          <ResultHandler
            isLoading={
              isLoadingPool1Data ||
              isLoadingPool2Data ||
              isLoadingPool3Data ||
              isLoadingLoopMarkets
            }
          >
            <div className={`w-full flex flex-wrap items-center gap-4`}>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-sm`}>Total Market Size</p>
                <p className={`font-semibold`}>
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
                <p className={`text-white/60 text-sm`}>Total Available</p>
                <p className={`font-semibold`}>
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
                <p className={`text-white/60 text-sm`}>Total Borrows</p>
                <p className={`font-semibold`}>
                  $
                  {poolData?.totalBorrowedFiat.toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  }) ?? '0'}
                </p>
                {/* this neeeds to be changed */}
              </div>
            </div>
          </ResultHandler>

          <button
            className={`px-6 mt-4 rounded-md py-1 transition-colors bg-accent text-darkone text-sm font-bold uppercase`}
            onClick={() => setSwapOpen(true)}
          >
            {'Wrap ETH '}

            <img
              alt=""
              className="inline-block"
              height="20"
              src="/img/symbols/32/color/eth.png"
              width="20"
            />
            <span>{' -> '}</span>
            <img
              alt=""
              className="inline-block"
              height="20"
              src="/img/symbols/32/color/weth.png"
              width="20"
            />
          </button>
        </div>
        <div className={`bg-grayone w-full px-[3%] mt-3 rounded-xl pt-3 pb-7`}>
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
            className={`w-full gap-x-1 hidden lg:grid  grid-cols-20 items-start py-4 text-[10px] text-white/40 font-semibold text-center px-2 `}
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
            isLoading={dataIsLoading}
          >
            <>
              {assets &&
                assets.map((val: MarketData, idx: number) => (
                  <PoolRows
                    asset={val.underlyingSymbol}
                    borrowAPR={`${
                      currentSdk
                        ?.ratePerBlockToAPY(
                          val?.borrowRatePerBlock ?? BigNumber.from(0),
                          getBlockTimePerMinuteByChainId(chainId)
                        )
                        .toFixed(2) ?? '0.00'
                    }%`}
                    borrowBalance={`${
                      val.borrowBalanceNative
                        ? parseFloat(
                            formatUnits(
                              val.borrowBalance,
                              val.underlyingDecimals
                            )
                          ).toLocaleString('en-US', {
                            maximumFractionDigits: 2
                          })
                        : '0'
                    } ${
                      val.underlyingSymbol
                    } / $${val.borrowBalanceFiat.toLocaleString('en-US', {
                      maximumFractionDigits: 2
                    })}`}
                    collateralFactor={
                      (val ? Number(formatEther(val.collateralFactor)) : 0) *
                      100
                    }
                    key={idx}
                    logo={`/img/symbols/32/color/${val.underlyingSymbol.toLowerCase()}.png`}
                    loopPossible={
                      loopMarkets ? loopMarkets[val.cToken].length > 0 : false
                    }
                    membership={val?.membership ?? false}
                    setPopupMode={setPopupMode}
                    setSelectedSymbol={setSelectedSymbol}
                    supplyAPR={`${
                      currentSdk
                        ?.ratePerBlockToAPY(
                          val?.supplyRatePerBlock ?? BigNumber.from(0),
                          getBlockTimePerMinuteByChainId(chainId)
                        )
                        .toFixed(2) ?? '0.00'
                    }%`}
                    supplyBalance={`${
                      val.supplyBalanceNative
                        ? parseFloat(
                            formatUnits(
                              val.supplyBalance,
                              val.underlyingDecimals
                            )
                          ).toLocaleString('en-US', {
                            maximumFractionDigits: 2
                          })
                        : '0'
                    } ${
                      val.underlyingSymbol
                    } / $${val.supplyBalanceFiat.toLocaleString('en-US', {
                      maximumFractionDigits: 2
                    })}`}
                    totalBorrowing={`${
                      val.totalBorrowNative
                        ? parseFloat(
                            formatUnits(val.totalBorrow, val.underlyingDecimals)
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
                            formatUnits(val.totalSupply, val.underlyingDecimals)
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
                ))}
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

      {swapOpen && <Swap close={() => setSwapOpen(false)} />}
    </>
  );
}

{
  /* <div className={``}></div>  <p className={``}></p>
          <p className={``}></p>  colleteralT , borrowingT , lendingT , cAPR , lAPR , bAPR} */
}
