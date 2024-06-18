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
import React, { useEffect, useMemo, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { useBalance } from 'wagmi';
import { useAccount } from 'wagmi';
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
  getChartData,
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
import { pools } from '@ui/constants/index';
import { useStore } from 'ui/store/Store';
import { INFO } from '@ui/constants/index';
import Popup, { PopupMode } from 'ui/app/_components/popup/page';
import { extractAndConvertStringTOValue } from '@ui/utils/stringToValue';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';
import Swap from 'ui/app/_components/popup/Swap';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';

interface IGraph {
  borrowAtY: number[];
  supplyAtY: number[];
  valAtX: string[];
}
const Asset = ({ params }: IProp) => {
  const { address: acc, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: acc
  });
  // console.log(data);
  const [info, setInfo] = useState<number>(INFO.BORROW);
  const searchParams = useSearchParams();

  //URL passed Data ----------------------------
  const availableAPR = searchParams.get('availableAPR');
  const borrowAPR = searchParams.get('borrowAPR');
  const collateralAPR = searchParams.get('collateralAPR');
  const lendingSupply = searchParams.get('lendingSupply');
  const gettingBorrows = searchParams.get('totalBorrows');
  const dropdownSelectedChain = searchParams.get('dropdownSelectedChain');
  const selectedChain = searchParams.get('selectedChain');
  const comptrollerAddress = searchParams.get('comptrollerAddress');
  const pool = searchParams.get('pool');
  const chain = searchParams.get('chain');
  const selectedSymbol = searchParams.get('selectedSymbol');
  //--------------------------------------------------------

  const [popupMode, setPopupMode] = useState<PopupMode>();
  const [swapOpen, setSwapOpen] = useState<boolean>(false);
  const [selectedPool, setSelectedPool] = useState(pool ? pool : pools[0].id);
  const [selectedMarketData, setSelectedMarketData] = useState<
    MarketData | undefined
  >();
  const [graph, setGraph] = useState<IGraph>({
    borrowAtY: [1, 0.1, 0.7, 0.3],
    supplyAtY: [1, 0.7, 0.2, 0.5],
    valAtX: ['a', 'b', 'c', 'd']
  });
  //Hooks -----------------------------------------------------
  const totalBorrows = extractAndConvertStringTOValue(
    gettingBorrows as string
  ).value2;

  const { data: poolData, isLoading: isLoadingPool1Data } = useFusePoolData(
    pool as string,
    Number(chain)
  );

  function extractTime(isoTimestamp: number) {
    // Parse the ISO 8601 timestamp
    let date = new Date(isoTimestamp);
    // Extract the time component and format it
    let hours = String(date.getUTCHours()).padStart(2, '0');
    let minutes = String(date.getUTCMinutes()).padStart(2, '0');
    let seconds = String(date.getUTCSeconds()).padStart(2, '0');  

    // Combine to get the full time string
    let timeStr = `${hours}:${minutes}`;
    return timeStr;
  }

  useEffect(() => {
    const SUPABASE_CLIENT_ANON_KEY =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78';
    async function fetchData() {
      try {
        const response = await fetch(
          'https://uoagtjstsdrjypxlkuzr.supabase.co/rest/v1/asset_total_apy_history?ctoken_address=eq.0xdb8ee6d1114021a94a045956bbeecf35d13a30f2&select=*',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              apikey: SUPABASE_CLIENT_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_CLIENT_ANON_KEY}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        console.log(data);
        let borrowAtY: number[] = [];
        let supplyAtY: number[] = [];
        let valAtX: string[] = [];
        data.forEach((val: { borrowApy: number }) =>
          borrowAtY.push(Number(val.borrowApy.toFixed(4)))
        );
        data.forEach((val: { supplyApy: number }) =>
          supplyAtY.push(Number(val.supplyApy.toFixed(4)))
        );
        data.forEach((val: { created_at: number }) =>
          valAtX.push(extractTime(val.created_at))
        );
        console.log();
        console.log(valAtX);
        setGraph({
          borrowAtY,
          supplyAtY,
          valAtX
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    // Call the function to fetch data
    fetchData();
  }, []);

  useEffect(() => {
    async function getmarketData() {
      try {
        const data = poolData?.assets.find(
          (_asset) => _asset.underlyingSymbol === selectedSymbol
        );
        console.log(data);
        setSelectedMarketData(data);
      } catch (err) {
        console.log(err);
      }
    }
    getmarketData();
  }, [selectedSymbol, poolData]);

  const { data: loopMarkets, isLoading: isLoadingLoopMarkets } = useLoopMarkets(
    poolData?.assets.map((asset) => asset.cToken) ?? []
  );

  return (
    <div className={` pb-10 relative `}>
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
            <p className={`font-semibold`}>${lendingSupply}</p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>Available APR</p>
            <p className={`font-semibold`}>{availableAPR}%</p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>Total Borrows</p>
            <p className={`font-semibold`}>${totalBorrows}</p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>Borrowing APR</p>
            <p className={`font-semibold`}>{borrowAPR}%</p>
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
            <div
              className={`cursor-pointer ${
                info !== INFO.SUPPLY ? 'text-white/40' : null
              }`}
              onClick={() => setInfo(INFO.SUPPLY)}
              // href={`${pathname}${params.asset}`}
            >
              Supply Info
            </div>
            <div
              className={` cursor-pointer ${
                info !== INFO.BORROW ? 'text-white/40' : null
              }`}
              onClick={() => setInfo(INFO.BORROW)}
            >
              Borrow Info
            </div>
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
                  TOTAL {info === INFO.BORROW ? 'Borrowed' : 'Supplied'}
                </p>
                <p className={`font-semibold`}>
                  ${info === INFO.BORROW ? totalBorrows : lendingSupply}
                </p>
                <p className={`font-semibold text-[8px] text-white/30`}>
                  ${totalBorrows} of ${totalBorrows}
                </p>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center gap-y-1`}
              >
                <p className={`text-white/60 text-[10px]`}>APR</p>
                <p className={`font-semibold`}>
                  ${info === INFO.BORROW ? borrowAPR : availableAPR}
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
              data={getChartData(
                graph.valAtX,
                info === INFO.BORROW ? graph.borrowAtY : graph.supplyAtY
              )}
              options={chartoptions}
              updateMode="resize"
            />
            {/* <div
              className={`w-full h-full flex items-center justify-center absolute top-0 right-0 backdrop-blur-sm bg-black/5 text-white/60  `}
            >
              <span>Comming Soon</span>
            </div> */}
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
          <p className={` font-semibold text-lg pt-1 `}>
            {isConnected ? Number(balance?.formatted).toFixed(4) : 0}{' '}
            {balance?.symbol}
          </p>
          <div className={` w-full h-[1px]  bg-white/30 mx-auto my-3`} />
          <p
            className={`text-white/60 w-full flex items-center justify-between text-sm mt-2`}
          >
            Available to Supply{' '}
          </p>
          <div
            className={`w-full font-semibold text-lg pt-1 flex items-center justify-between `}
          >
            <span> {lendingSupply} USDC</span>
            <div
              className={`rounded-lg bg-accent text-sm cursor-pointer text-black py-1 px-3`}
              onClick={async () => {
                const result = await handleSwitchOriginChain(
                  Number(dropdownSelectedChain),
                  Number(selectedChain)
                );
                if (result) {
                  setPopupMode(PopupMode.SUPPLY);
                }
              }}
            >
              Supply
            </div>
          </div>
          <div
            className={`text-white/60 w-full flex items-center justify-between text-[10px] `}
          >
            ${lendingSupply}
          </div>
          <p
            className={`text-white/60 w-full flex items-center justify-between text-sm mt-3`}
          >
            Available to Borrow{' '}
          </p>
          <div
            className={`w-full font-semibold text-lg pt-1 flex items-center justify-between `}
          >
            <span> {totalBorrows} USDC</span>
            <div
              className={`rounded-lg bg-graylite text-sm cursor-pointer text-white/50 py-1 px-3`}
              onClick={async () => {
                const result = await handleSwitchOriginChain(
                  Number(dropdownSelectedChain),
                  Number(selectedChain)
                );
                if (result) {
                  setPopupMode(PopupMode.BORROW);
                }
              }}
            >
              Borrow
            </div>
          </div>
          <div
            className={`text-white/60 w-full flex items-center justify-between text-[10px] `}
          >
            ${totalBorrows}
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
              <span>Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
      {popupMode && selectedMarketData && poolData && (
        <Popup
          closePopup={() => setPopupMode(undefined)}
          comptrollerAddress={comptrollerAddress as string}
          loopMarkets={loopMarkets}
          mode={popupMode}
          selectedMarketData={selectedMarketData}
        />
      )}

      {swapOpen && (
        <Swap
          close={() => setSwapOpen(false)}
          dropdownSelectedChain={Number(dropdownSelectedChain)}
          selectedChain={Number(selectedChain)}
        />
      )}
    </div>
  );
};

export default Asset;
