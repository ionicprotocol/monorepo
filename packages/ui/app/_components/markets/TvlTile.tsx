/* eslint-disable @next/next/no-img-element */
'use client';

// import dynamic from 'next/dynamic';
// import { fraxtal } from 'viem/chains';

// import SwapWidget from './SwapWidget';
// const SwapWidget = dynamic(() => import('./SwapWidget'), {
//   ssr: false
// });

import { pools } from '@ui/constants/index';
import type { PoolData } from '@ui/types/TokensDataMap';

import ResultHandler from '../ResultHandler';

interface IProp {
  dropdownSelectedChain: string;
  poolData: PoolData;
  isLoadingPoolData: boolean;
  isLoadingLoopMarkets: boolean;
  selectedPool: string;
}
export default function TvlTile({
  dropdownSelectedChain,
  poolData,
  isLoadingPoolData,
  isLoadingLoopMarkets,
  selectedPool
}: IProp) {
  return (
    <div
      className={`w-full h-full col-span-3 px-2 lg:px-[2%] xl:px-[3%] flex flex-wrap  flex-col items-center justify-center md:justify-start  bg-grayone  py-4 rounded-md`}
    >
      <div className="flex md:flex-row flex-col  w-full md:gap-2 ">
        {Object.entries(pools)
          .filter(([chainId]) => chainId === dropdownSelectedChain.toString())
          .map(([, chainData], chainIdx) =>
            chainData.pools.map((pool, poolIdx) => (
              <div
                className={`flex items-center justify-center gap-2  ${pool.id === selectedPool ? 'flex' : 'hidden'}`}
                key={`${chainIdx}-${poolIdx}`}
              >
                <img
                  alt="modlogo"
                  className={`md:w-8 w-6`}
                  src={chainData.logo}
                />
                <h1 className={`font-semibold`}>{pool.name}</h1>
              </div>
            ))
          )}
      </div>
      <div className="h-[2px] w-[95%] mx-auto bg-white/10 lg:my-3 my-2  " />
      <div
        className={` w-full   flex flex-wrap   items-center justify-center md:justify-start gap-4`}
      >
        <ResultHandler isLoading={isLoadingPoolData || isLoadingLoopMarkets}>
          <div className={`flex flex-col items-start justify-center  gap-y-1`}>
            <p className={`text-white/60 md:text-xs text-[10px]`}>
              Total Market Size
            </p>
            <p className={`font-semibold md:text-base text-xs`}>
              $
              {poolData
                ? (
                    poolData?.totalSuppliedFiat + poolData?.totalBorrowedFiat
                  ).toLocaleString('en-US', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })
                : '0'}
            </p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60  md:text-xs text-[10px]`}>
              Total Supplied
            </p>
            <p className={`font-semibold md:text-base text-xs`}>
              $
              {poolData?.totalSuppliedFiat.toLocaleString('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
              }) ?? '0'}
            </p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60 md:text-xs text-[10px]`}>
              Total Borrows
            </p>
            <p className={`font-semibold md:text-base text-xs`}>
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
      {/* <div className="w-full flex flex-row gap-x-3 justify-center md:justify-start md:mx-0">
        <button
          className={`px-6   md:mx-0 rounded-md py-1 transition-colors bg-accent text-darkone text-sm font-bold uppercase`}
          onClick={() => setSwapOpen(true)}
        >
          {`Wrap ${+dropdownSelectedChain === fraxtal.id ? 'frxETH' : 'ETH'} `}

          <img
            alt=""
            className="inline-block"
            height="20"
            src={`/img/symbols/32/color/${+dropdownSelectedChain === fraxtal.id ? 'frxeth' : 'eth'}.png`}
            width="20"
          />
          <span>{' -> '}</span>
          <img
            alt=""
            className="inline-block"
            height="20"
            src={`/img/symbols/32/color/${+dropdownSelectedChain === fraxtal.id ? 'wfrxeth' : 'weth'}.png`}
            width="20"
          />
        </button>

        <button
          className={`px-6  md:mx-0 rounded-md py-1 transition-colors bg-accent text-darkone text-xs font-bold uppercase`}
          onClick={() => setSwapWidgetOpen(true)}
        >
          {'Swap Assets'}
        </button>

        <SwapWidget
          close={() => setSwapWidgetOpen(false)}
          open={swapWidgetOpen}
          toChain={+dropdownSelectedChain}
        />
      </div> */}
    </div>
  );
}
