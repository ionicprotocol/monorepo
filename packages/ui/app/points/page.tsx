/* eslint-disable @next/next/no-img-element */
'use client';

import {
  usePointsForBorrow,
  usePointsForSupply
} from '@ui/hooks/usePointsQueries';
import FlatMap from '../_components/points_comp/FlatMap';
import ReferralLeaderboard from '../_components/points_comp/ReferralLeaderboard';
import StrategyROW from '../_components/points_comp/StrategyROW';
import { useMemo } from 'react';
import ResultHandler from '../_components/ResultHandler';
import Link from 'next/link';

export default function Points() {
  const strategyData = [
    {
      amount: 2,
      color: '#f3fa96ff',
      earnBy: 'referral',
      percent: 45,
      points: 435,
      vaultSupply: 34
    },
    {
      amount: 54,
      color: '#c768f2ff',
      earnBy: 'supply',
      percent: 53,
      points: 24,
      vaultSupply: 65
    },
    {
      amount: 67,
      color: '#f29c3fff',
      earnBy: 'borrow',
      percent: 35,
      points: 34,
      vaultSupply: 34
    }
  ];

  const leaderboardData = [
    {
      eid: '0x4e1b87465e51e1557e5b097f363e873d893e0ca2',
      percent: 98,
      points: 34,
      vaultSupply: 98437
    },
    {
      eid: '0x8f3a11c613CfE14980e0325d3aB4E172Fd347f1B',
      percent: 28,
      points: 549,
      vaultSupply: 3573
    },
    {
      eid: '0x1D46B84cFeBb50Cfb5b257fA32f902B1d704f513',
      percent: 78,
      points: 982,
      vaultSupply: 426
    }
  ];
  const { data: supplyPoints, isLoading: isLoadingSupplyPoints } =
    usePointsForSupply();
  const { data: borrowPoints, isLoading: isLoadingBorrowPoints } =
    usePointsForBorrow();
  const summedSupplyPoints = useMemo<number>(() => {
    if (supplyPoints) {
      return supplyPoints.rows.reduce(
        (accumulator, current) =>
          accumulator +
          current.reduce(
            (innerAccumulator, innerCurrent) => innerAccumulator + innerCurrent,
            0
          ),
        0
      );
    }

    return 0;
  }, [supplyPoints]);
  const summedBorrowPoints = useMemo<number>(() => {
    if (borrowPoints) {
      return borrowPoints.rows.reduce(
        (accumulator, current) =>
          accumulator +
          current.reduce(
            (innerAccumulator, innerCurrent) => innerAccumulator + innerCurrent,
            0
          ),
        0
      );
    }

    return 0;
  }, [borrowPoints]);
  const totalPoints = useMemo<number>(
    () => summedBorrowPoints + summedSupplyPoints,
    [summedBorrowPoints, summedSupplyPoints]
  );

  return (
    <main
      className={`py-14  flex flex-col items-center justify-start min-h-screen transition-all duration-200 ease-linear`}
    >
      <div className="w-[70%] flex flex-col items-start py-4 justify-start bg-grayone h-min px-[3%] rounded-xl">
        <div
          className={`flex items-center text-xl justify-center gap-2 py-3 pt-2 `}
        >
          <img
            alt="modlogo"
            className={`w-5`}
            src="/img/assets/back.png"
          />
          <h1 className={`font-semibold `}>Your Points</h1>
        </div>
        <p className={`text-[10px] text-white/50`}>TOTAL AMOUNT</p>

        <div className="mx-auto my-1">
          <ResultHandler
            center
            height="36"
            isLoading={isLoadingBorrowPoints || isLoadingSupplyPoints}
            width="36"
          >
            <p className={`text-3xl font-bold text-white`}>{totalPoints}</p>
          </ResultHandler>
        </div>
        <p className={`text-sm text-white/50 mx-auto mb-2`}>
          Your Global Rank : 36
        </p>
        <div className={` w-full h-[1px]  bg-white/30 mx-auto my-3`} />
        <div
          className={` w-full flex items-center justify-between text-[10px]  text-white/50`}
        >
          <p className={``}>Points for Supply</p>
          <ResultHandler
            height="15"
            isLoading={isLoadingSupplyPoints}
            width="15"
          >
            <p className={`text-white font-semibold`}>{summedSupplyPoints}</p>
          </ResultHandler>
        </div>
        <div
          className={` w-full flex items-center justify-between text-[10px]  text-white/50`}
        >
          <p className={``}>Points for Borrow</p>
          <ResultHandler
            height="15"
            isLoading={isLoadingBorrowPoints}
            width="15"
          >
            <p className={`text-white font-semibold`}>{summedBorrowPoints}</p>
          </ResultHandler>
        </div>
        <div className={` w-full h-[1px]  bg-white/30 mx-auto my-3`} />
        <Link
          className={`w-full rounded-md bg-accent text-black py-2 px-6 text-center text-xs mt-auto  `}
          href="/dashboard"
        >
          Go to Dashboard - Earn more Points
        </Link>
        <p className={` text-lg font-semibold mx-auto mt-3`}>
          How do Points work ?
        </p>
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
          strategyData.map((val, idx: number) => (
            <StrategyROW
              amount={val.amount}
              color={val.color}
              earnBy={val.earnBy}
              key={idx}
              percent={val.percent}
              points={val.points}
              vaultSupply={val.vaultSupply}
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
          leaderboardData.map((val, idx: number) => (
            <ReferralLeaderboard
              eid={val.eid}
              key={idx}
              percent={val.percent}
              points={val.points}
              rank={idx + 1}
              vaultSupply={val.vaultSupply}
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
          leaderboardData.map((val, idx: number) => (
            <ReferralLeaderboard
              eid={val.eid}
              key={idx}
              percent={val.percent}
              points={val.points}
              rank={idx + 1}
              vaultSupply={val.vaultSupply}
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
