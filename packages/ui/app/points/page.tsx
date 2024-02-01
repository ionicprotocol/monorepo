/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import FlatMap from '../_components/points_comp/FlatMap';
import StrategyROW from '../_components/points_comp/StrategyROW';
import ReferralLeaderboard from '../_components/points_comp/ReferralLeaderboard';

export default function Points() {
  const strategyData = [
    {
      earnBy: 'referral',
      amount: 2,
      vaultSupply: 34,
      points: 435,
      percent: 45,
      color: '#f3fa96ff'
    },
    {
      earnBy: 'supply',
      amount: 54,
      vaultSupply: 65,
      points: 24,
      percent: 53,
      color: '#c768f2ff'
    },
    {
      earnBy: 'borrow',
      amount: 67,
      vaultSupply: 34,
      points: 34,
      percent: 35,
      color: '#f29c3fff'
    }
  ];

  const leaderboardData = [
    {
      eid: '0x4e1b87465e51e1557e5b097f363e873d893e0ca2',
      vaultSupply: 98437,
      points: 34,
      percent: 98
    },
    {
      eid: '0x8f3a11c613CfE14980e0325d3aB4E172Fd347f1B',
      vaultSupply: 3573,
      points: 549,
      percent: 28
    },
    {
      eid: '0x1D46B84cFeBb50Cfb5b257fA32f902B1d704f513',
      vaultSupply: 426,
      points: 982,
      percent: 78
    }
  ];
  return (
    <main
      className={`py-14  flex flex-col items-center justify-start min-h-screen transition-all duration-200 ease-linear`}
    >
      <div className="w-[70%] flex flex-col items-start py-4 justify-start bg-grayone h-min px-[3%] rounded-xl">
        <div
          className={`flex items-center text-xl justify-center gap-2 py-3 pt-2 `}
        >
          <img
            src="/img/assets/back.png"
            alt="modlogo"
            className={`w-5`}
          />
          <h1 className={`font-semibold `}>Your Points</h1>
        </div>
        <p className={`text-[10px] text-white/50`}>TOTAL AMOUNT</p>
        <p className={`text-3xl font-bold text-white mx-auto my-1`}>964783</p>
        <p className={`text-sm text-white/50 mx-auto mb-2`}>
          Your Global Rank : 36
        </p>
        <div className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}></div>
        <div
          className={` w-full flex items-center justify-between text-[10px]  text-white/50`}
        >
          <p className={``}>Points for Supply</p>
          <p className={`text-white font-semibold`}>873</p>
        </div>
        <div
          className={` w-full flex items-center justify-between text-[10px]  text-white/50`}
        >
          <p className={``}>Points for Borrow</p>
          <p className={`text-white font-semibold`}>8348</p>
        </div>
        <div
          className={` w-full flex items-center justify-between text-[10px]  text-white/50`}
        >
          <p className={``}>Points for Referal</p>
          <p className={`text-white font-semibold`}>27</p>
        </div>
        <div
          className={` w-full flex items-center justify-between text-[10px]  text-white/50`}
        >
          <p className={``}>Points for Extra</p>
          <p className={`text-white font-semibold`}>987</p>
        </div>
        <div className={` w-full h-[1px]  bg-white/30 mx-auto my-3`}></div>
        <button
          className={`w-full rounded-md bg-accent text-black py-2 px-6 text-center text-xs mt-auto  `}
        >
          CLAIM POINTS
        </button>
        <p className={` text-sm mx-auto mt-3`}>How do Points work ?</p>
        {/* this will be a link inn future */}
      </div>
      <div className="w-[70%] flex flex-col items-start py-4 justify-start mt-3 bg-grayone h-min px-[3%] rounded-xl">
        <p className={`font-semibold text-lg `}>Your Earning Strategy</p>
        <div
          className={` w-full flex items-center justify-between text-[10px] my-2 text-white/50`}
        >
          <p className={``}>Total Points</p>
          <p className={`text-white font-semibold`}>4359</p>
        </div>

        <FlatMap />
        <div
          className={`w-full gap-x-1 grid  grid-cols-5  py-4 text-[10px] text-white/40 font-semibold text-center  `}
        >
          <h3 className={` `}>STRATEGY</h3>
          <h3 className={` `}>AMOUNT</h3>
          <h3 className={` `}>VAULT SUPPLY</h3>
          <h3 className={` `}>POINTS</h3>
          <h3 className={` `}>PERCENTAGE EARNINGS</h3>
        </div>
        {strategyData &&
          strategyData.map((val: any, idx: number) => (
            <StrategyROW
              key={idx}
              color={val.color}
              earnBy={val.earnBy}
              amount={val.amount}
              vaultSupply={val.vaultSupply}
              points={val.points}
              percent={val.percent}
            />
          ))}
      </div>

      <div className="w-[70%] flex flex-col items-start py-4 mt-3 justify-start bg-grayone h-min px-[3%] rounded-xl">
        <h1 className={`font-semibold text-xl `}>Your Top Referrals</h1>
        <div
          className={` w-full flex items-center justify-between text-[10px] my-2 text-white/50`}
        >
          <p className={``}>Total Referrals</p>
          <p className={`text-white font-semibold`}>43</p>
        </div>
        <div
          className={`w-full gap-x-1 grid  grid-cols-7  py-4 text-[10px] text-white/40 font-semibold text-center  `}
        >
          <h3 className={` `}>PERFORMER</h3>
          <h3 className={` col-span-3 `}>ID</h3>
          <h3 className={` `}>VAULT SUPPLY</h3>
          <h3 className={` `}>POINTS</h3>
          <h3 className={` `}>% EARNINGS</h3>
        </div>
        {leaderboardData &&
          leaderboardData.map((val: any, idx: number) => (
            <ReferralLeaderboard
              key={idx}
              rank={idx + 1}
              eid={val.eid}
              vaultSupply={val.vaultSupply}
              points={val.points}
              percent={val.percent}
            />
          ))}
      </div>
      <div className="w-[70%] flex flex-col items-start py-4 mt-3 justify-start bg-grayone h-min px-[3%] rounded-xl">
        <h1 className={`font-semibold text-xl `}>Global Leaderboard </h1>
        <div
          className={` w-full flex items-center justify-between text-[10px] my-2 text-white/50`}
        >
          <p className={``}>Total Referrals</p>
          <p className={`text-white font-semibold`}>43</p>
        </div>
        <div
          className={`w-full gap-x-1 grid  grid-cols-7  py-4 text-[10px] text-white/40 font-semibold text-center  `}
        >
          <h3 className={` `}>PERFORMER</h3>
          <h3 className={` col-span-3 `}>ID</h3>
          <h3 className={` `}>VAULT SUPPLY</h3>
          <h3 className={` `}>POINTS</h3>
          <h3 className={` `}>% EARNINGS</h3>
        </div>
        {leaderboardData &&
          leaderboardData.map((val: any, idx: number) => (
            <ReferralLeaderboard
              key={idx}
              rank={idx + 1}
              eid={val.eid}
              vaultSupply={val.vaultSupply}
              points={val.points}
              percent={val.percent}
            />
          ))}
      </div>
    </main>
  );
}
//  amount: 67,
// vaultSupply: 34,
// points: 34,
// percent: 345,
// vaultSupply : 426,
// points: 982,
// percent: 78,
