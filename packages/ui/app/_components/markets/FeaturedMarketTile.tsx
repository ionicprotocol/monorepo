/* eslint-disable @next/next/no-img-element */
'use client';
import type { Dispatch, SetStateAction } from 'react';

import { PopupMode } from '../popup/page';
import ResultHandler from '../ResultHandler';

// import BorrowPopover from './BorrowPopover';
// import SupplyPopover from './SupplyPopover';

// import { pools } from '@ui/constants/index';
import WrapEthSwaps from './WrapEthSwaps';

import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';
import { useStore } from 'ui/store/Store';

interface Iprop {
  selectedChain: number;
  setPopupMode: Dispatch<SetStateAction<PopupMode | undefined>>;
  setSelectedSymbol: Dispatch<SetStateAction<string | undefined>>;
  isLoadingPoolData: boolean;
  dropdownSelectedChain: string;
  setSwapWidgetOpen: any;
  swapWidgetOpen: boolean;
}

export default function FeaturedMarketTile({
  selectedChain,
  setPopupMode,
  setSelectedSymbol,
  isLoadingPoolData = true,
  dropdownSelectedChain,
  setSwapWidgetOpen,
  swapWidgetOpen
}: Iprop) {
  // const {
  //   asset,
  //   borrowAPR,
  //   rewardsAPR,
  //   dropdownSelectedChain,
  //   selectedPoolId,
  //   cToken,
  //   pool,
  //   rewards,
  //   loopPossible
  // } = useStore((state) => state.featuredBorrow);
  const featuredSupply = useStore((state) => state.featuredSupply);
  const featuredSupply2 = useStore((state) => state.featuredSupply2);

  return (
    <div
      className={`w-full col-span-3 h-full px-2 lg:px-[2%] xl:px-[3%] flex  flex-col items-center justify-start gap-3 bg-grayone  py-4 rounded-md`}
    >
      {/* this will get maped on basis of featured  */}
      <span className={` mr-auto text-xl font-semibold`}>Featured Markets</span>
      <div
        className={`w-full gap-x-3 hidden lg:grid  grid-cols-4 items-start  text-[10px] text-white/40 font-semibold text-center px-2 `}
      >
        <h3 className={` `}>ASSETS</h3>
        <h3 className={` `}>APR</h3>
      </div>
      <ResultHandler
        center
        isLoading={isLoadingPoolData}
      >
        {featuredSupply.asset && (
          <div
            className={`lg:grid lg:grid-cols-4 flex flex-col gap-x-3 w-full items-center justify-center px-1 py-3 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl `}
          >
            <div className="flex items-center justify-center gap-1 mr-auto sm:mr-0 ml-2 lg:ml-0 ">
              <img
                src={`/img/symbols/32/color/${featuredSupply.asset.toLowerCase()}.png`}
                alt="abc"
                className={`w-4 inline-block`}
              />
              <span className="text-xs">{featuredSupply.asset}</span>
            </div>
            <div
              className={`popover-container  relative flex lg:flex-col items-center justify-between lg:justify-center cursor-pointer w-full  gap-2 lg:pt-0 py-3 lg:py-0  `}
            >
              <span className="text-white/40 font-semibold lg:mr-0 mr-auto ml-2 lg:ml-0 text-[11px] lg:hidden text-left   ">
                APR
              </span>
              <div className=" flex lg:flex-col  md:ml-0  my-auto items-center justify-center">
                <span className={`mr-1 md:mr-0 text-xs  text-center `}>
                  +
                  {featuredSupply.supplyAPRTotal?.toLocaleString('en-US', {
                    maximumFractionDigits: 1
                  }) ?? '-'}
                  %
                </span>
                {/* <SupplyPopover
                  asset={featuredSupply.asset}
                  supplyAPR={featuredSupply.supplyAPR}
                  rewards={featuredSupply.rewards}
                  dropdownSelectedChain={featuredSupply.dropdownSelectedChain}
                  selectedPoolId={featuredSupply.selectedPoolId}
                  cToken={featuredSupply.cToken}
                  pool={featuredSupply.pool}
                /> */}
              </div>
            </div>
            <button
              className={`rounded-md bg-accent text-black lg:py-1.5 py-1 px-1 col-span-2  uppercase truncate text-xs w-[80%] mx-auto `}
              onClick={async () => {
                const result = await handleSwitchOriginChain(
                  featuredSupply.dropdownSelectedChain,
                  selectedChain
                );
                if (result) {
                  setSelectedSymbol(featuredSupply.asset);
                  setPopupMode(PopupMode.SUPPLY);
                }
              }}
            >
              Supply / Withdraw
            </button>
          </div>
        )}
        {featuredSupply2.asset && (
          <div
            className={`lg:grid lg:grid-cols-4 flex flex-col gap-x-3 w-full items-center justify-center px-1 py-3 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl   `}
          >
            <div className="flex items-center justify-center gap-1 mr-auto sm:mr-0 ml-2 lg:ml-0">
              <img
                src={`/img/symbols/32/color/${featuredSupply2.asset.toLowerCase()}.png`}
                alt="asset"
                className={`w-4 inline-block`}
              />
              <span className={`text-xs`}>{featuredSupply2.asset}</span>
            </div>
            <div
              className={`popover-container flex h-full w-full py-2 lg:py-0 lg:flex-col items-center justify-center gap-2  cursor-pointer`}
            >
              <span className="text-white/40 font-semibold  text-[11px] lg:hidden text-left lg:mr-0 mr-auto ml-2 lg:ml-0">
                APR
              </span>
              <div className=" flex lg:flex-col flex-wrap md:ml-0 ml-auto">
                <span
                  className={`mr-1 md:mr-0 text-xs lg:w-full   text-center`}
                >
                  +
                  {featuredSupply2.supplyAPRTotal?.toLocaleString('en-US', {
                    maximumFractionDigits: 1
                  }) ?? '-'}
                  %
                </span>
                {/* <SupplyPopover
                  asset={featuredSupply2.asset}
                  supplyAPR={featuredSupply2.supplyAPR}
                  rewards={featuredSupply2.rewards}
                  dropdownSelectedChain={featuredSupply2.dropdownSelectedChain}
                  selectedPoolId={featuredSupply2.selectedPoolId}
                  cToken={featuredSupply2.cToken}
                  pool={featuredSupply2.pool}
                /> */}
              </div>
            </div>
            <button
              className={`rounded-md bg-accent text-black lg:py-1.5 py-2 px-1 col-span-2  uppercase truncate text-xs w-[80%] mx-auto flex items-center justify-center`}
              onClick={async () => {
                const result = await handleSwitchOriginChain(
                  featuredSupply2.dropdownSelectedChain,
                  selectedChain
                );
                if (result) {
                  setSelectedSymbol(featuredSupply2.asset);
                  setPopupMode(PopupMode.SUPPLY);
                }
              }}
            >
              Supply / Withdraw
            </button>
            {/* <button
            className={`rounded-md ${pools[dropdownSelectedChain].bg} ${pools[dropdownSelectedChain].text} text-xs w-[80%] col-span-2  py-2  lg:py-1.5 text-center px-1  uppercase truncate flex items-center justify-center mx-auto`}
            onClick={async () => {
              const result = await handleSwitchOriginChain(
                dropdownSelectedChain,
                selectedChain
              );
              if (result) {
                setSelectedSymbol(asset);
                setPopupMode(PopupMode.BORROW);
              }
            }}
          >
            Borrow / Repay {loopPossible && '/ Loop'}
          </button> */}
          </div>
        )}
      </ResultHandler>
      <WrapEthSwaps
        setSwapWidgetOpen={setSwapWidgetOpen}
        swapWidgetOpen={swapWidgetOpen}
        dropdownSelectedChain={+dropdownSelectedChain}
      />
    </div>
  );
}
