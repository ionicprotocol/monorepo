/* eslint-disable @next/next/no-img-element */
'use client';

import millify from 'millify';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useChainId } from 'wagmi';

import FlatMap from '../_components/points_comp/FlatMap';
import PercentMeter from '../_components/points_comp/PercentMeter';
import ResultHandler from '../_components/ResultHandler';

import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import {
  usePointsForBorrow,
  usePointsForSupply
} from '@ui/hooks/usePointsQueries';

export default function Points() {
  const router = useRouter();
  const chainId = useChainId();
  const { data: marketData, isLoading: isLoadingMarketData } = useFusePoolData(
    '0',
    chainId
  );
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
    <div className="w-full lg:w-[70%] mx-auto">
      <div className=" flex flex-col items-start py-4 justify-start bg-grayone h-min px-[3%] rounded-xl">
        <div
          className={`flex items-center text-xl justify-center gap-2 py-3 pt-2 `}
        >
          <img
            alt="modlogo"
            className={`w-5 cursor-pointer`}
            onClick={() => router.back()}
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
            <p className={`text-3xl font-bold text-white`}>
              {totalPoints.toLocaleString('en-US', {
                maximumFractionDigits: 0
              })}
            </p>
          </ResultHandler>
        </div>
        <p className={`text-sm text-white/50 mx-auto mb-2`}>
          Your Global Rank :{' '}
          <span className="px-2 py-1 bg-lime rounded-lg text-md text-darkone whitespace-nowrap">
            Soon!
          </span>
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
            <p className={`text-white font-semibold`}>
              {summedSupplyPoints.toLocaleString('en-US', {
                maximumFractionDigits: 0
              })}
            </p>
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
            <p className={`text-white font-semibold`}>
              {summedBorrowPoints.toLocaleString('en-US', {
                maximumFractionDigits: 0
              })}
            </p>
          </ResultHandler>
        </div>
        <div className={` w-full h-[1px]  bg-white/30 mx-auto my-3`} />
        <Link
          className={`w-full flex justify-center items-center rounded-md bg-neutral-500	text-black py-2 px-6 text-center text-xs mt-auto text-white`}
          href="/"
        >
          Go to Markets - Earn more Points by supplying and borrowing
          <Image
            alt="ionic minilogo"
            className="ml-2"
            height="20"
            src="/img/ionic-minilogo.png"
            width="21"
          />
        </Link>
        <Link
          className={` text-lg font-semibold mx-auto mt-3`}
          href="https://doc.ionic.money/ionic-documentation/tokenomics/stage-1-points-squared"
          target="_blank"
        >
          How do Points work ?
        </Link>
        {/* this will be a link inn future */}
      </div>
      <div className=" flex flex-col items-start py-4 justify-start mt-3 bg-grayone h-min px-[3%] rounded-xl">
        <p className={`font-semibold text-lg `}>Your Earning Strategy</p>
        <div
          className={` w-full flex items-center justify-between text-[10px] my-2 text-white/50`}
        >
          <p className={``}>Total Points</p>
          <ResultHandler
            height="15"
            isLoading={isLoadingSupplyPoints || isLoadingBorrowPoints}
            width="15"
          >
            <p className={`text-white font-semibold`}>
              {totalPoints.toLocaleString('en-US', {
                maximumFractionDigits: 0
              })}
            </p>
          </ResultHandler>
        </div>

        <ResultHandler
          center
          isLoading={
            isLoadingMarketData ||
            isLoadingSupplyPoints ||
            isLoadingBorrowPoints
          }
        >
          <>
            <div className="w-full mb-2 md:mt-0">
              <FlatMap rewardsData={[summedSupplyPoints, summedBorrowPoints]} />
            </div>

            <div
              className={`hidden md:grid w-full gap-x-1  grid-cols-4 py-4 text-[10px] text-white/40 font-semibold text-center `}
            >
              <h3 className={` `}>STRATEGY</h3>
              <h3 className={` `}>AMOUNT</h3>
              <h3 className={` `}>POINTS</h3>
              <h3 className={` `}>PERCENTAGE EARNINGS</h3>
            </div>
            <div
              className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 md:grid  grid-cols-4  py-5 text-xs text-white/80 font-semibold text-center items-center `}
            >
              <div
                className={`  flex gap-2 items-center justify-center mb-2 md:mb-0`}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: `#3bff89` }}
                />
                <span className={` `}>Supply</span>
              </div>
              <div className={`mb-2 md:mb-0`}>
                <span className="text-white/40 font-semibold mr-2 md:hidden text-right">
                  AMOUNT:
                </span>
                ${millify(marketData?.totalSupplyBalanceFiat ?? 0)}
              </div>
              <div className={`mb-4 md:mb-0`}>
                <span className="text-white/40 font-semibold mr-2 md:hidden text-right">
                  POINTS:
                </span>
                {summedSupplyPoints.toLocaleString('en-US', {
                  maximumFractionDigits: 0
                })}
              </div>
              <PercentMeter
                color="#3bff89"
                percent={
                  parseFloat(
                    ((summedSupplyPoints / totalPoints) * 100).toFixed(1)
                  ) || 0
                }
              />
            </div>
            <div
              className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 md:grid  grid-cols-4  py-5 text-xs text-white/80 font-semibold text-center items-center `}
            >
              <div
                className={`  flex gap-2 items-center justify-center  mb-2 md:mb-0`}
              >
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: `#f3fa96` }}
                />
                <span className={` `}>Borrow</span>
              </div>
              <div className={`mb-2 md:mb-0`}>
                <span className="text-white/40 font-semibold mr-2 md:hidden text-right">
                  AMOUNT:
                </span>
                ${millify(marketData?.totalBorrowBalanceFiat ?? 0)}
              </div>
              <div className={`mb-4 md:mb-0`}>
                <span className="text-white/40 font-semibold mr-2 md:hidden text-right">
                  POINTS:
                </span>
                {summedBorrowPoints.toLocaleString('en-US', {
                  maximumFractionDigits: 0
                })}
              </div>
              <PercentMeter
                color="#f3fa96"
                percent={
                  parseFloat(
                    ((summedBorrowPoints / totalPoints) * 100).toFixed(1)
                  ) || 0
                }
              />
            </div>
          </>
        </ResultHandler>
      </div>

      {/* <div className=" flex flex-col items-start py-4 mt-3 justify-start bg-grayone h-min px-[3%] rounded-xl">
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
      </div> */}
      <div className=" flex flex-col items-start py-4 mt-3 justify-start bg-grayone h-min px-[3%] rounded-xl">
        <h1 className={`font-semibold text-xl `}>Global Leaderboard </h1>
        <div
          className={` w-full flex items-center justify-center text-[10px] my-2 text-white/50`}
        >
          <span className="px-4 py-2 bg-lime rounded-lg text-lg text-darkone whitespace-nowrap">
            Coming Soon!
          </span>
        </div>
      </div>
    </div>
  );
}
//  amount: 67,
// vaultSupply: 34,
// points: 34,
// percent: 345,
// vaultSupply : 426,
// points: 982,
// percent: 78,
