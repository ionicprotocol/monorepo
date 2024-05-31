/* eslint-disable */
'use client';
//---------------------IMPORTS-------------------
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import Link from 'next/link';
// import { Link } from '@tanstack/react-router'
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';

//-------------------Interfaces------------
interface IProp {
  params: { asset: string };
}

//------misc---------
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

//-------------------------components-----------

import {
  chartdata,
  chartdata2,
  chartoptions,
  chartoptions2,
  donutdata,
  donutoptions
} from '../../../_constants/mock';

// const data = [
//   { name: 'Group A', value: 400 },
//   { name: 'Group B', value: 300 },
//   { name: 'Group C', value: 300 },
//   { name: 'Group D', value: 200 }
// ];
// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

import { useStore } from 'ui/store/Store';

const Asset = ({ params }: IProp) => {
  //here we need to make a api to get the data of a certain asset (we can also check the current user with the help of wagmi)
  //params.asset will be use to get the data of a certain asset

  const pathname = usePathname();
  // using mock data
  const assetdetails = {
    asset: 'ETH', //
    bAPR: 8345,
    borrowingT: 435,
    cAPR: 25,
    colleteralT: 454,
    lAPR: 45,
    lendingT: 65655
  };

  const passedData = useStore((state) => state.passedData);

  const searchParams = useSearchParams();
  const info = searchParams.get('info');
  return (
    <div className={` pb-10 `}>
      <div
        className={`w-full flex flex-col items-start py-4 justify-start bg-grayone h-min px-[3%] rounded-xl`}
      >
        <div className={`flex items-center justify-center gap-1 py-3 pt-2 `}>
          <Link
            className={`w-full h-full`}
            href={`/market`}
          >
            <img
              alt="modlogo"
              className={`h-5 cursor-pointer`}
              src="/img/assets/back.png"
            />
          </Link>
          <img
            alt={params.asset}
            className={`w-8`}
            src={`/img/symbols/32/color/${params.asset}.png`}
          />
          <h1 className={`font-semibold`}>{params.asset}</h1>
          <img
            alt="linkto"
            className={`w-4`}
            src="/img/assets/link.png"
          />
        </div>
        <div className={`w-full flex items-center gap-4`}>
          <div className={`flex flex-col items-start justify-center  gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>Lending Supply</p>
            <p className={`font-semibold`}>${passedData?.lendingSupply}</p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>Available APR</p>
            <p className={`font-semibold`}>{passedData?.availableAPR}%</p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>Total Borrows</p>
            <p className={`font-semibold`}>${passedData?.totalBorrows}</p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>Borrowing APR</p>
            <p className={`font-semibold`}>{passedData?.borrowAPR}%</p>
            {/* this neeeds to be changed */}
          </div>
        </div>
      </div>
      <div
        className={`grid grid-cols-6 grid-rows-2  gap-y-3 gap-x-3 items-start justify-start  mt-4 `}
      >
        <div
          className={` rounded-xl col-span-4 min-h-[33vh] pb-3 flex-col bg-grayone flex gap-4 px-[3%] items-start justify-start`}
        >
          <div
            className={`flex  justify-center gap-4 px-4 py-2 font-bold text-base `}
          >
            <Link
              className={` ${info ? 'text-white/40' : null}`}
              href={`/market/details/${params.asset}`}
            >
              Supply Info
            </Link>
            <Link
              className={` ${info ? null : 'text-white/40'}`}
              href={`/market/details/${params.asset}?info=BORROW`}
            >
              Borrow Info
            </Link>
          </div>

          <div className={`w-full flex items-center justify-start gap-5`}>
            <div className={` w-14 h-14`}>
              <Doughnut
                data={donutdata}
                options={donutoptions}
                updateMode="resize"
              />
            </div>

            <div className={`w-[40%] flex gap-5 items-start justify-start `}>
              <div
                className={`flex flex-col items-start justify-center gap-y-1`}
              >
                <p className={`text-white/60 text-[10px]`}>
                  TOTAL {info ? 'Borrowed' : 'Supplied'}
                </p>
                <p className={`font-semibold`}>
                  ${info ? passedData?.totalBorrows : passedData?.lendingSupply}
                </p>
                <p className={`font-semibold text-[8px] text-white/30`}>
                  ${assetdetails.borrowingT} of ${assetdetails.borrowingT}
                </p>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center gap-y-1`}
              >
                <p className={`text-white/60 text-[10px]`}>APR</p>
                <p className={`font-semibold`}>
                  ${info ? passedData?.borrowAPR : passedData?.availableAPR}
                </p>
                {/* this neeeds to be changed */}
              </div>
            </div>
            {/* <div className={`w-[40%] flex gap-5 items-start justify-start`}>
              <div
                className={`flex flex-col  items-center justify-center gap-y-1`}
              >
                <img
                  alt={assetdetails.asset}
                  className={`h-6`}
                  src={`/img/logo/${assetdetails.asset}.png `}
                />
                <p className={`text-white/60 text-[8px] text-center`}>
                  COLLATERAL ASSET
                </p>
                <p className={`font-semibold text-sm`}>{assetdetails.asset}</p>
              </div>
              <div
                className={`flex flex-col items-start justify-center gap-y-1 w-full `}
              >
                <div
                  className={`text-white/60 w-full flex items-center justify-between text-[10px]`}
                >
                  <p>Lending Supply</p>
                  <p className={`font-semibold`}>${assetdetails.lendingT}</p>
                </div>
                <div
                  className={`text-white/60 w-full flex items-center justify-between text-[10px]`}
                >
                  <p>Available APR</p>
                  <p className={`font-semibold`}>{assetdetails.lAPR}% </p>
                </div>
                <div
                  className={`text-white/60 w-full flex items-center justify-between text-[10px]`}
                >
                  <p>Total Borrows</p>
                  <p className={`font-semibold`}>${assetdetails.borrowingT}</p>
                </div>
                <div
                  className={`text-white/60 w-full flex items-center justify-between text-[10px]`}
                >
                  <p>Borrowing APR</p>
                  <p className={`font-semibold`}>{assetdetails.bAPR}% </p>
                </div>
              </div>
            </div> */}
          </div>

          <div className={`relative w-full h-28`}>
            <Line
              data={chartdata}
              options={chartoptions}
              updateMode="resize"
            />
            <div
              className={`w-full h-full flex items-center justify-center absolute top-0 right-0 backdrop-blur-sm bg-black/5 text-white/60  `}
            >
              <span>Comming Soon</span>
            </div>
          </div>
        </div>
        <div
          className={` rounded-xl  col-span-2 row-span-2 min-h-[40vh] bg-grayone flex flex-col  items-start p-[3%] justify-start`}
        >
          <p className={` font-bold text-xl  py-2`}>Your Info </p>
          <p
            className={`text-white/60 w-full flex items-center justify-between text-sm mt-3`}
          >
            Wallet Info
          </p>
          <p className={` font-semibold text-lg pt-1 `}>$786</p>
          <div className={` w-full h-[1px]  bg-white/30 mx-auto my-3`} />
          <p
            className={`text-white/60 w-full flex items-center justify-between text-sm mt-2`}
          >
            Available to Supply{' '}
          </p>
          <div
            className={`w-full font-semibold text-lg pt-1 flex items-center justify-between `}
          >
            <span> 568793 USDC</span>
            <Link
              className={`rounded-lg bg-accent text-sm text-black py-1 px-3`}
              href={`${pathname}?popmode=SUPPLY`}
            >
              Supply
            </Link>
          </div>
          <div
            className={`text-white/60 w-full flex items-center justify-between text-[10px] `}
          >
            $568793
          </div>
          <p
            className={`text-white/60 w-full flex items-center justify-between text-sm mt-3`}
          >
            Available to Borrow{' '}
          </p>
          <div
            className={`w-full font-semibold text-lg pt-1 flex items-center justify-between `}
          >
            <span> 786 USDC</span>
            <Link
              className={`rounded-lg bg-graylite text-sm  text-white/50 py-1 px-3`}
              href={`${pathname}?popmode=BORROW`}
            >
              Borrow
            </Link>
          </div>
          <div
            className={`text-white/60 w-full flex items-center justify-between text-[10px] `}
          >
            $867
          </div>
          <div
            className={`flex my-4 items-center justify-center w-full py-2 px-3 rounded-xl border border-[#f3fa96ff] text-[#f3fa96ff]`}
          >
            <img
              alt="warn"
              className={`h-7 px-2`}
              src={`/img/assets/warn.png `}
            />
            <span className={`text-sm py-1`}>
              To borrow you need to supply any asset to be used as collateral
            </span>
          </div>
        </div>
        <div
          className={` rounded-xl row-start-2 px-[3%] col-span-4 min-h-[33vh] bg-grayone flex flex-col gap-3 items-start justify-start`}
        >
          <div
            className={`flex w-full  justify-between items-center gap-4  py-2 font-bold text-base `}
          >
            <p className={``}>Interest Rate Model</p>
            <div
              className={`text-[10px] flex items-center justify-center gap-2`}
            >
              <span>Interest Rate Strategy</span>
              <img
                alt="link"
                className={`h-4`}
                src={`/img/assets/link.png `}
              />
            </div>
          </div>
          <div
            className={`text-white/60 w-full flex flex-col items-start  text-xs `}
          >
            <p>Utilisation Rate</p>
            <p className={`font-semibold text-lg text-white`}>--</p>
          </div>
          <div className={`relative w-full h-28`}>
            <Line
              data={chartdata2}
              options={chartoptions2}
              updateMode="resize"
            />
            <div
              className={`w-full h-full flex items-center justify-center absolute top-0 right-0 backdrop-blur-sm bg-black/5 text-white/60  `}
            >
              <span>Comming Soon</span>
            </div>
          </div>
        </div>
      </div>
      {/* {popmode && <Popup mode={popmode} />} */}
    </div>
  );
};

export default Asset;
