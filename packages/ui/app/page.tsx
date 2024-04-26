/* eslint-disable @next/next/no-img-element */
'use client';

import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { BigNumber } from 'ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils.js';
import { Fragment, useMemo, useState } from 'react';
import { base, mode } from 'viem/chains';
import { useChainId, useSwitchChain } from 'wagmi';

import PoolRows from './_components/markets/PoolRows';
import type { PopupMode } from './_components/popup/page';
import Popup from './_components/popup/page';
import Swap from './_components/popup/Swap';
import ResultHandler from './_components/ResultHandler';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import type { MarketData } from '@ui/types/TokensDataMap';
import { getBlockTimePerMinuteByChainId } from '@ui/utils/networkData';

function classNames(...classes: boolean[] | string[]) {
  return classes.filter(Boolean).join(' ');
}

const markets = [
  {
    avatar: '/img/logo/BASE.png',
    id: base.id,
    name: 'Base Market'
  },
  {
    avatar: '/img/logo/MODE.png',
    id: mode.id,
    name: 'Mode Market'
  }
];

export default function Market() {
  const [swapOpen, setSwapOpen] = useState<boolean>(false);
  const { getSdk } = useMultiIonic();
  const [popupMode, setPopupMode] = useState<PopupMode>();
  const chainId = useChainId();
  const market = markets.find((market) => market.id === chainId);
  const [selectedMarket, setSelectedMarket] = useState(market ?? markets[0]);
  const sdk = getSdk(market?.id ?? base.id);
  const { switchChain } = useSwitchChain();
  const { data: poolData, isLoading: isLoadingPoolData } = useFusePoolData(
    '0',
    selectedMarket.id
  );
  const assets = useMemo<MarketData[] | undefined>(
    () => poolData?.assets,
    [poolData]
  );
  const dataIsLoading = useMemo<boolean>(
    () => isLoadingPoolData,
    [isLoadingPoolData]
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string>();
  const selectedMarketData = useMemo<MarketData | undefined>(
    () =>
      poolData?.assets.find(
        (_asset) => _asset.underlyingSymbol === selectedSymbol
      ),
    [selectedSymbol, poolData]
  );

  return (
    <>
      <div className="w-full  flex flex-col items-center justify-start transition-all duration-200 ease-linear">
        <div
          className={`w-full flex flex-col items-start py-4 justify-start bg-grayone h-min px-[3%] rounded-xl`}
        >
          <Listbox
            onChange={(event) => {
              setSelectedMarket(event);
              switchChain({ chainId: event.id });
            }}
            value={selectedMarket}
          >
            {({ open }) => (
              <>
                <div className="relative mt-2">
                  <Listbox.Button
                    className={`${
                      selectedMarket.id === base.id
                        ? 'ring-baseblue'
                        : 'ring-lime'
                    } relative w-full cursor-default rounded-md bg-grayone py-1.5 pl-3 pr-10 text-left text-white shadow-sm ring-2 ring-inset focus:outline-none sm:text-sm sm:leading-6`}
                  >
                    <span className="flex items-center">
                      <img
                        alt=""
                        className="h-5 w-5 flex-shrink-0 rounded-full"
                        src={selectedMarket.avatar}
                      />
                      <span className="ml-3 block truncate">
                        {selectedMarket.name}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                      <ChevronUpDownIcon
                        aria-hidden="true"
                        className="h-5 w-5 text-gray-400"
                      />
                    </span>
                  </Listbox.Button>

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    show={open}
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-grayone py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {markets.map((person) => (
                        <Listbox.Option
                          className={({ active }) =>
                            classNames(
                              active ? 'bg-accent text-white' : 'text-white',
                              'relative cursor-default select-none py-2 pl-3 pr-9'
                            )
                          }
                          key={person.id}
                          value={person}
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <img
                                  alt=""
                                  className="h-5 w-5 flex-shrink-0 rounded-full"
                                  src={person.avatar}
                                />
                                <span
                                  className={classNames(
                                    selected ? 'font-semibold' : 'font-normal',
                                    'ml-3 block truncate'
                                  )}
                                >
                                  {person.name}
                                </span>
                              </div>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? 'text-white' : 'text-indigo-600',
                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                  )}
                                >
                                  <CheckIcon
                                    aria-hidden="true"
                                    className="h-5 w-5"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
          <ResultHandler isLoading={isLoadingPoolData}>
            <div className={`w-full flex flex-wrap items-center gap-4 pt-4`}>
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
                      sdk
                        ?.ratePerBlockToAPY(
                          val?.borrowRatePerBlock ?? BigNumber.from(0),
                          getBlockTimePerMinuteByChainId(selectedMarket.id)
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
                    membership={val?.membership ?? false}
                    setPopupMode={setPopupMode}
                    setSelectedSymbol={setSelectedSymbol}
                    supplyAPR={`${
                      sdk
                        ?.ratePerBlockToAPY(
                          val?.supplyRatePerBlock ?? BigNumber.from(0),
                          getBlockTimePerMinuteByChainId(selectedMarket.id)
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
