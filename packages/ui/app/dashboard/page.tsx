/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import SupplyRows from '../_components/dashboards/SupplyRows';
import Popup from '../_components/popup/page';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
export default function Dashboard() {
  const searchParams = useSearchParams();
  const popmode = searchParams.get('popmode');
  const specific = searchParams.get('specific');
  const supplyrow = [
    {
      asset: 'DUSD',
      amount: 168,
      cAPR: 2,
      sAPR: 5,
      utilisation: 234,
      rewards: 65
    },
    {
      asset: 'DUSD',
      amount: 245,
      cAPR: 42,
      sAPR: 54,
      utilisation: 234354,
      rewards: 64535
    },
    {
      asset: 'DUSD',
      amount: 45,
      cAPR: 6,
      sAPR: 765,
      utilisation: 2364,
      rewards: 6588
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
                <p className={`font-semibold`}>$867</p>
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
                <p className={`font-semibold`}>$29387</p>
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
                <p className={`font-semibold`}>4.54%</p>
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
              href={`/points`}
              className={`w-full rounded-md bg-accent text-black py-2 px-6 text-center text-xs mt-auto  `}
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
            supplyrow.map((val: any, idx: number) => (
              <SupplyRows
                key={idx}
                asset={val.asset}
                amount={val.amount}
                cAPR={val.cAPR}
                sAPR={val.sAPR}
                utilisation={val.utilisation}
                rewards={val.rewards}
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
            supplyrow.map((val: any, idx: number) => (
              <SupplyRows
                mode={'BORROW'}
                key={idx}
                asset={val.asset}
                amount={val.amount}
                cAPR={val.cAPR}
                sAPR={val.sAPR}
                utilisation={val.utilisation}
                rewards={val.rewards}
              />
            ))}
        </div>
      </div>
      {popmode && (
        <Popup
          mode={popmode}
          specific={specific}
        />
      )}
    </main>
  );
}
