/* eslint-disable @next/next/no-img-element */
'use client';
import type { Dispatch, SetStateAction } from 'react';

import { PopupMode } from '../popup/page';

import BorrowPopover from './BorrowPopover';
import SupplyPopover from './SupplyPopover';

import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';
import { useStore } from 'ui/store/Store';
import { pools } from '@ui/constants/index';

interface Iprop {
  selectedChain: number;
  setPopupMode: Dispatch<SetStateAction<PopupMode | undefined>>;
  setSelectedSymbol: Dispatch<SetStateAction<string | undefined>>;
}

export default function FeaturedMarketTile({
  selectedChain,
  setPopupMode,
  setSelectedSymbol
}: Iprop) {
  const {
    asset,
    borrowAPR,
    rewardsAPR,
    dropdownSelectedChain,
    selectedPoolId,
    cToken,
    pool,
    rewards,
    loopPossible
  } = useStore((state) => state.featuredBorrow);
  const featuredSupply = useStore((state) => state.featuredSupply);
  return (
    <div
      className={`w-full col-span-3 h-full px-2 lg:px-[2%] xl:px-[3%] flex  flex-col items-center justify-center md:justify-start gap-3 bg-grayone  py-4 rounded-md`}
    >
      {/* this will get maped on basis of featured  */}
      <span className={` mr-auto text-xl font-semibold`}>Featured Market </span>
      <div
        className={`w-full gap-x-3 hidden md:grid  grid-cols-4 items-start  text-[10px] text-white/40 font-semibold text-center px-2 `}
      >
        <h3 className={` `}>ASSETS</h3>
        <h3 className={` `}>APR</h3>
      </div>
      <div
        className={`grid grid-cols-4 gap-x-3 w-full items-center justify-center px-1 py-3 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl`}
      >
        <div className="flex items-center justify-center gap-1">
          <img
            src={`/img/symbols/32/color/${featuredSupply.asset.toLowerCase()}.png`}
            alt="abc"
            className={`w-4 inline-block`}
          />
          <span className='text-xs'>{featuredSupply.asset}</span>
        </div>
        <div
          className={`popover-container relative flex md:flex-col items-center justify-between md:justify-center cursor-pointer`}
        >
          {' '}
          <SupplyPopover
            asset={featuredSupply.asset}
            supplyAPR={featuredSupply.supplyAPR}
            rewards={featuredSupply.rewards}
            dropdownSelectedChain={featuredSupply.dropdownSelectedChain}
            selectedPoolId={featuredSupply.selectedPoolId}
            cToken={featuredSupply.cToken}
            pool={featuredSupply.pool}
          />
        </div>
        <button
          className={`rounded-md bg-accent text-black py-1.5 px-1 col-span-2  uppercase truncate text-xs w-[80%]`}
          onClick={async () => {
            const result = await handleSwitchOriginChain(
              dropdownSelectedChain,
              selectedChain
            );
            if (result) {
              setSelectedSymbol(asset);
              setPopupMode(PopupMode.SUPPLY);
            }
          }}
        >
          Supply / Withdraw
        </button>
      </div>
      <div
        className={`grid grid-cols-4 gap-x-3 w-full items-center justify-center px-1 py-3 col-span-2 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl `}
      >
        <div className="flex items-center justify-center gap-1">
          <img
            src={`/img/symbols/32/color/${asset.toLowerCase()}.png`}
            alt="asset"
            className={`w-4 inline-block`}
          />
          <span className={`text-xs`}>{asset}</span>
        </div>
        <div
          className={`popover-container flex h-full md:flex-col items-center justify-center  cursor-pointer`}
        >
          <BorrowPopover
            asset={asset}
            borrowAPR={borrowAPR}
            rewardsAPR={rewardsAPR}
            dropdownSelectedChain={dropdownSelectedChain}
            selectedPoolId={selectedPoolId}
            cToken={cToken}
            pool={pool}
            rewards={rewards}
          />
        </div>
        <button
          className={`rounded-md ${pools[dropdownSelectedChain].bg} ${pools[dropdownSelectedChain].text} text-xs w-[80%] col-span-2 py-1.5 px-1 uppercase truncate`}
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
        </button>
      </div>
    </div>
  );
}
