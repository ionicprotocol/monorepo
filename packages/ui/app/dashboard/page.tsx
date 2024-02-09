/* eslint-disable @next/next/no-img-element */
'use client';

import millify from 'millify';
import Link from 'next/link';
import { useMemo } from 'react';
import { useChainId } from 'wagmi';

import SupplyRows from '../_components/dashboards/SupplyRows';
import ResultHandler from '../_components/ResultHandler';

import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useTotalSupplyAPYs } from '@ui/hooks/useTotalSupplyAPYs';

export default function Dashboard() {
  const chainId = useChainId();
  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    '0',
    chainId
  );
  const { data: assetsSupplyAprData } = useTotalSupplyAPYs(
    marketData?.assets ?? [],
    chainId
  );
  const [totalCollateral, avgCollateralApr] = useMemo<
    [string, string] | [undefined, undefined]
  >(() => {
    if (marketData && assetsSupplyAprData) {
      let calculatedTotalCollateral = 0;
      let totalApr = 0;
      let memberships = 0;

      marketData.assets.forEach((asset) => {
        if (asset.membership) {
          calculatedTotalCollateral += asset.supplyBalanceFiat;
          totalApr += assetsSupplyAprData[asset.cToken].apy;

          memberships++;
        }
      });

      return [
        `$${millify(calculatedTotalCollateral)}`,
        `${(totalApr / memberships).toFixed(2)}%`
      ];
    }

    return [undefined, undefined];
  }, [assetsSupplyAprData, marketData]);

  const supplyrow = [
    {
      amount: 168,
      asset: 'DUSD',
      cAPR: 2,
      rewards: 65,
      sAPR: 5,
      utilisation: 234
    },
    {
      amount: 245,
      asset: 'DUSD',
      cAPR: 42,
      rewards: 64535,
      sAPR: 54,
      utilisation: 234354
    },
    {
      amount: 45,
      asset: 'DUSD',
      cAPR: 6,
      rewards: 6588,
      sAPR: 765,
      utilisation: 2364
    }
  ];
  return (
    <main className={`pt-14`}>
      <div className="w-full flex flex-col items-start justify-start min-h-screen transition-all duration-200 ease-linear px-[3%]">
        <div
          className={`grid grid-cols-8 gap-x-3 my-2 w-full  font-semibold text-base `}
        >
          <div
            className={`w-full bg-grayone rounded-xl py-3 px-6   col-span-3   flex flex-col items-center justify-start `}
          >
            <div className={`w-full flex justify-between  pb-6 items-center`}>
              <span>NET ASSET VALUE</span>
              <span> $56,87,939</span>
            </div>
            <div className={`flex items-center justify-between w-full gap-x-3`}>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>Total Collateral</p>
                <p className={`font-semibold`}>
                  <ResultHandler
                    height="24"
                    isLoading={!totalCollateral}
                    width="24"
                  >
                    {totalCollateral}
                  </ResultHandler>
                </p>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>Total Utilization</p>
                <p className={`font-semibold`}>$36782</p>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>Total Supply</p>
                <p className={`font-semibold`}>
                  <ResultHandler
                    height="24"
                    isLoading={isLoadingMarketData}
                    width="24"
                  >
                    ${millify(marketData?.totalSupplyBalanceFiat ?? 0)}
                  </ResultHandler>
                </p>
                {/* this neeeds to be changed */}
              </div>
            </div>
          </div>
          <div
            className={`w-full bg-grayone rounded-xl py-3 px-6 col-span-3 flex flex-col items-center justify-start `}
          >
            <div className={`w-full flex justify-between  pb-6 items-center`}>
              <span>NET APR</span>
              <span> 2.99 %</span>
            </div>
            <div className={`flex items-center justify-between w-full gap-x-3`}>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>EVG. COLLATERAL APR</p>
                <p className={`font-semibold`}>
                  <ResultHandler
                    height="24"
                    isLoading={!avgCollateralApr}
                    width="24"
                  >
                    {avgCollateralApr}
                  </ResultHandler>
                </p>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>EVG BORROWING APR</p>
                <p className={`font-semibold`}>4%</p>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center  gap-y-1`}
              >
                <p className={`text-white/60 text-xs`}>EVG SUPPLY APR</p>
                <p className={`font-semibold`}>78%</p>
                {/* this neeeds to be changed */}
              </div>
            </div>
          </div>
          <div
            className={`w-full bg-grayone rounded-xl py-3 px-6 col-span-2 flex flex-col items-center justify-start `}
          >
            <div className={`w-full flex justify-between items-center`}>
              <span>CLAIMABLE POINTS</span>
              <span> 73982</span>
            </div>
            <Link
              className={`w-full rounded-md bg-accent text-black py-2 px-6 text-center text-xs mt-auto  `}
              href={`/points`}
            >
              CLAIM POINTS
            </Link>
          </div>
        </div>
        <div className={`bg-grayone  w-full px-6 py-3 mt-3 rounded-xl`}>
          <div className={` w-full flex items-center justify-between py-3 `}>
            <h1 className={`font-semibold`}>Your Collateral (supply)</h1>
            <div
              className={` min-w-[30%] flex gap-x-2  items-center justify-center `}
            >
              <img
                alt="searchico"
                className={`h-4`}
                src="/img/assets/search.png"
              />
              <input
                className={
                  ' w-full focus:outline-none placeholder:text-xs  bg-grayone border-r px-2 border-white/20'
                }
                id=""
                name=""
                placeholder="Search by asset name, symbol or address"
                type="text"
              />
              <div
                className={`flex w-[30%] flex-nowrap items-center justify-center text-xs px-2`}
              >
                <p className="w-full truncate flex-nowrap">Sort By</p>
                <img
                  alt="downarr"
                  className={`w-4`}
                  src="/img/assets/downarr.png"
                />
              </div>
            </div>
          </div>
          <div
            className={`w-full gap-x-1 grid  grid-cols-8  py-4 text-[10px] text-white/40 font-semibold text-center  `}
          >
            <h3 className={` `}>SUPPLY ASSETS</h3>
            <h3 className={` `}>AMOUNT</h3>
            <h3 className={` `}>COLLATERAL APR</h3>
            <h3 className={` `}>SUPPLY APR</h3>
            <h3 className={` `}>UTILISATION</h3>
            <h3 className={` `}>REWARDS</h3>
          </div>
          {supplyrow &&
            supplyrow.map((val, idx: number) => (
              <SupplyRows
                amount={val.amount}
                asset={val.asset}
                cAPR={val.cAPR}
                key={idx}
                rewards={val.rewards}
                sAPR={val.sAPR}
                utilisation={val.utilisation}
              />
            ))}
        </div>
        <div className={`bg-grayone  w-full px-6 py-3 mt-3 rounded-xl`}>
          <div className={` w-full flex items-center justify-between py-3 `}>
            <h1 className={`font-semibold`}>Your Borrows (Loans)</h1>
            <div
              className={` min-w-[30%] flex gap-x-2  items-center justify-center `}
            >
              <img
                alt="searchico"
                className={`h-4`}
                src="/img/assets/search.png"
              />
              <input
                className={
                  ' w-full focus:outline-none placeholder:text-xs  bg-grayone border-r px-2 border-white/20'
                }
                id=""
                name=""
                placeholder="Search by asset name, symbol or address"
                type="text"
              />
              <div
                className={`flex w-[30%] flex-nowrap items-center justify-center text-xs px-2`}
              >
                <p className="w-full truncate flex-nowrap">Sort By</p>
                <img
                  alt="downarr"
                  className={`w-4`}
                  src="/img/assets/downarr.png"
                />
              </div>
            </div>
          </div>
          <div
            className={`w-full gap-x-1 grid  grid-cols-8  py-4 text-[10px] text-white/40 font-semibold text-center  `}
          >
            <h3 className={` `}>SUPPLY ASSETS</h3>
            <h3 className={` `}>AMOUNT</h3>
            <h3 className={` `}>COLLATERAL APR</h3>
            <h3 className={` `}>SUPPLY APR</h3>
            <h3 className={` `}>UTILISATION</h3>
            <h3 className={` `}>REWARDS</h3>
          </div>
          {supplyrow &&
            supplyrow.map((val, idx: number) => (
              <SupplyRows
                amount={val.amount}
                asset={val.asset}
                cAPR={val.cAPR}
                key={idx}
                mode={'BORROW'}
                rewards={val.rewards}
                sAPR={val.sAPR}
                utilisation={val.utilisation}
              />
            ))}
        </div>
      </div>
      {/* {popmode && (
        <Popup
          mode={popmode}
          specific={specific}
        />
      )} */}
    </main>
  );
}
