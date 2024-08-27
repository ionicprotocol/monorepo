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
import { createClient } from '@supabase/supabase-js';
// import { Link } from '@tanstack/react-router'
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { useBalance, useAccount } from 'wagmi';
// import { useGetMaxBorrow } from 'ui/app/util/utils';
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
  donutoptions,
  getDonutData
} from '../../../_constants/mock';

// const data = [
//   { name: 'Group A', value: 400 },
//   { name: 'Group B', value: 300 },
//   { name: 'Group C', value: 300 },
//   { name: 'Group D', value: 200 }
// ];
// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
import { INFO } from '@ui/constants/index';
import Popup, { PopupMode } from 'ui/app/_components/popup/page';
import { extractAndConvertStringTOValue } from '@ui/utils/stringToValue';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';
import Swap from 'ui/app/_components/popup/Swap';
import { MarketData, PoolData } from '@ui/types/TokensDataMap';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import { useLoopMarkets } from '@ui/hooks/useLoopMarkets';
import millify from 'millify';
import { Address, formatEther, formatUnits } from 'viem';
import { useBorrowCapsDataForAsset } from '@ui/hooks/fuse/useBorrowCapsDataForAsset';
import { useUsdPrice } from '@ui/hooks/useAllUsdPrices';
import { useSupplyCapsDataForAsset } from '@ui/hooks/fuse/useSupplyCapsDataForPool';
import BorrowAmount from 'ui/app/_components/markets/BorrowAmount';
import { sendIMG } from '@ui/utils/TempImgSender';
import { useBorrowAPYs } from '@ui/hooks/useBorrowAPYs';
import { useSupplyAPYs } from '@ui/hooks/useSupplyAPYs';

interface IGraph {
  borrowAtY: number[];
  supplyAtY: number[];
  valAtX: string[];
}

const supabase = createClient(
  'https://uoagtjstsdrjypxlkuzr.supabase.co/',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYWd0anN0c2RyanlweGxrdXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc5MDE2MTcsImV4cCI6MjAyMzQ3NzYxN30.CYck7aPTmW5LE4hBh2F4Y89Cn15ArMXyvnP3F521S78'
);

const Asset = ({ params }: IProp) => {
  const router = useRouter();
  const { address: acc, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: acc
  });
  // console.log(data);
  const [info, setInfo] = useState<number>(INFO.BORROW);
  const searchParams = useSearchParams();

  //URL passed Data ----------------------------
  const dropdownSelectedChain = searchParams.get('dropdownSelectedChain');
  const selectedChain = searchParams.get('selectedChain');
  const comptrollerAddress = searchParams.get('comptrollerAddress');
  const cTokenAddress = searchParams.get('cTokenAddress');
  const pool = searchParams.get('pool');
  const chain = searchParams.get('chain');
  const selectedSymbol = searchParams.get('selectedSymbol');
  //--------------------------------------------------------

  const [popupMode, setPopupMode] = useState<PopupMode>();
  const [swapOpen, setSwapOpen] = useState<boolean>(false);
  // const [selectedPool, setSelectedPool] = useState(pool ? pool : pools[0].id);
  const [selectedMarketData, setSelectedMarketData] = useState<
    MarketData | undefined
  >();
  const [graph, setGraph] = useState<IGraph>({
    borrowAtY: [0.4, 0.1, 0.4, 0.3, 0.4, 0.5, 0.3, 0.6, 0.2],
    supplyAtY: [0.2, 0.7, 0.2, 0.5, 0.4, 0.3, 0.4, 0.5, 0.3],
    valAtX: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
  });
  //Hooks -----------------------------------------------------
  const { data: poolData } = useFusePoolData(pool as string, Number(chain));

  const assetData = useMemo<MarketData | undefined>(
    () => poolData?.assets.find((a) => a.cToken === cTokenAddress),
    [poolData, cTokenAddress]
  );
  const { data: borrowAPYs } = useBorrowAPYs(assetData ? [assetData] : []);
  const borrowAPR = assetData?.cToken ? borrowAPYs?.[assetData?.cToken] : 0;
  const { data: supplyAPYs } = useSupplyAPYs(assetData ? [assetData] : []);
  const availableAPR = assetData?.cToken ? supplyAPYs?.[assetData?.cToken] : 0;
  const totalSupplied = assetData?.totalSupplyNative
    ? parseFloat(
        formatUnits(assetData!.totalSupply, assetData.underlyingDecimals)
      ).toLocaleString('en-US', {
        maximumFractionDigits: 2
      })
    : '0';

  const totalBorrows = assetData?.totalBorrowNative
    ? parseFloat(
        formatUnits(assetData!.totalBorrow, assetData.underlyingDecimals)
      ).toLocaleString('en-US', {
        maximumFractionDigits: 2
      })
    : '0';

  function extractTime(isoTimestamp: number) {
    // Parse the ISO 8601 timestamp
    let date = new Date(isoTimestamp);
    // Extract the date, month, and year
    let day = String(date.getUTCDate()).padStart(2, '0');
    let month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    let year = date.getUTCFullYear();

    // Extract the time component and format it
    let hours = String(date.getUTCHours()).padStart(2, '0');
    let minutes = String(date.getUTCMinutes()).padStart(2, '0');
    // let seconds = String(date.getUTCSeconds()).padStart(2, '0');

    // Combine to get the full time string
    let timeStr = `${hours}:${minutes}`;
    let dateStr = `${day}-${month}-${year}`;

    return { timeStr, dateStr };
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('asset_total_apy_history')
          .select('*')
          .ilike('ctoken_address', cTokenAddress as string);

        if (error) {
          throw new Error(`HTTP error! Status: ${error.message}`);
        }

        // const data = await history?.json();

        let borrowOBJAtY: { apy: number; createdAt: string }[] = [];
        let borrowAtY: number[] = [];
        let supplyOBJAtY: { apy: number; createdAt: string }[] = [];
        let supplyAtY: number[] = [];
        let valAtX: string[] = [];
        //filteriing and pusing borrowapy of each date-----------------------------
        data.forEach((val: { borrowApy: number; created_at: number }) => {
          if (
            extractTime(val.created_at).dateStr ===
            borrowOBJAtY[borrowOBJAtY.length - 1]?.createdAt
          )
            return;
          borrowOBJAtY.push({
            apy: Number(val.borrowApy.toFixed(4)),
            createdAt: extractTime(val.created_at).dateStr
          });
        });
        borrowOBJAtY.forEach((val) => borrowAtY.push(val.apy));

        //filteriing and pusing supplyapy of each date-------------------------
        data.forEach((val: { supplyApy: number; created_at: number }) => {
          if (
            extractTime(val.created_at).dateStr ===
            supplyOBJAtY[supplyOBJAtY.length - 1]?.createdAt
          )
            return;
          supplyOBJAtY.push({
            apy: Number(val.supplyApy.toFixed(4)),
            createdAt: extractTime(val.created_at).dateStr
          });
        });
        supplyOBJAtY.forEach((val) => supplyAtY.push(val.apy));

        //filtering data basedon date------------------------------------
        // data.forEach((val: { created_at: number }) => {
        //   if (
        //     extractTime(val.created_at).dateStr ===
        //     borrowOBJAtY[borrowOBJAtY.length - 1]?.createdAt
        //   )
        //     return;
        //   valAtX.push(extractTime(val.created_at).dateStr);
        // });
        supplyOBJAtY.forEach((val) => valAtX.push(val.createdAt));
        console.log();
        // console.log(valAtX);
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
  // Borrow cap numbers -----------------
  const { data: borrowCap } = useBorrowCapsDataForAsset(
    selectedMarketData?.cToken,
    Number(chain)
  );
  const { data: usdPrice } = useUsdPrice(chain as string);

  const pricePerSingleAsset = useMemo<number>(
    () =>
      parseFloat(formatEther(selectedMarketData?.underlyingPrice || 0n)) *
      (usdPrice ?? 0),
    [selectedMarketData, usdPrice]
  );
  const borrowCapAsNumber = useMemo<number>(
    () =>
      parseFloat(
        formatUnits(
          borrowCap?.totalBorrowCap || 0n,
          selectedMarketData?.underlyingDecimals || 0
        )
      ),
    [borrowCap, selectedMarketData?.underlyingDecimals]
  );

  const borrowCapAsFiat = useMemo<number>(
    () => pricePerSingleAsset * borrowCapAsNumber,
    [pricePerSingleAsset, borrowCapAsNumber]
  );

  // Supply cap number ----------------------------

  const { data: supplyCap } = useSupplyCapsDataForAsset(
    comptrollerAddress as Address,
    selectedMarketData?.cToken,
    Number(chain)
  );
  const supplyCapAsNumber = useMemo<number>(
    () =>
      parseFloat(
        formatUnits(
          supplyCap?.supplyCaps || 0n,
          selectedMarketData?.underlyingDecimals || 0
        )
      ),
    [supplyCap, selectedMarketData?.underlyingDecimals]
  );
  const supplyCapAsFiat = useMemo<number>(
    () => pricePerSingleAsset * supplyCapAsNumber,
    [pricePerSingleAsset, supplyCapAsNumber]
  );
  const totalSupplyAsNumber = useMemo<number>(
    () =>
      parseFloat(
        formatUnits(
          selectedMarketData?.totalSupply || 0n,
          selectedMarketData?.underlyingDecimals || 0
        )
      ),
    [selectedMarketData?.totalSupply, selectedMarketData?.underlyingDecimals]
  );

  const { address } = useAccount();
  const { data: availableToSupply } = useBalance({
    address,
    token: selectedMarketData?.underlyingToken as Address,
    query: {
      refetchInterval: 6000
    }
  });

  // const gotMaxBorrowAmount = useMemo<string>(()=>{
  //   console.log(selectedMarketData)
  //   return formatUnits(
  //   maxBorrowAmount?.bigNumber.toBigInt() || BigInt(0),
  //   selectedMarketData?.underlyingDecimals.toNumber() || 0
  // )},[selectedMarketData, comptrollerAddress , chain])

  // const getBorrowAmount = useStore((state) => state.borrowAmount);
  return (
    <div className={` pb-10 relative `}>
      <div
        className={`w-full flex flex-col items-start py-4 justify-start bg-grayone h-min px-[3%] rounded-xl`}
      >
        <div className={`flex items-center justify-center gap-1 py-3 pt-2 `}>
          <button
            className={`w-full h-full cursor-pointer`}
            onClick={() => router.back()}
          >
            <img
              alt="back"
              className={`h-5 `}
              src="/img/assets/back.png"
            />
          </button>
          <img
            alt={params.asset}
            className={`w-8`}
            src={sendIMG(pool as string, chain as string, params.asset)}
          />
          <h1 className={`font-semibold`}>{params.asset}</h1>
          {/* <img
            alt="linkto"
            className={`w-4`}
            src="/img/assets/link.png"
          /> */}
        </div>
        <div className={`w-full flex items-center gap-4`}>
          <div className={`flex flex-col items-start justify-center  gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>Total Supply</p>
            <p className={`font-semibold`}>
              {totalSupplied} {selectedSymbol}
            </p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>Supply APY</p>
            <p className={`font-semibold`}>{availableAPR}%</p>
            {/* this neeeds to be changed */}
          </div>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>Total Borrows</p>
            <p className={`font-semibold`}>
              {totalBorrows} {selectedSymbol}
            </p>
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
        className={`grid grid-cols-6 md:grid-rows-2  gap-y-3 gap-x-3 items-start justify-start  mt-4 `}
      >
        <div
          className={` rounded-xl md:col-span-4 col-span-6 min-h-[33vh] pb-3 flex-col bg-grayone flex gap-4 px-[3%] items-start justify-start`}
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
                data={getDonutData(
                  Math.round(
                    info === INFO.BORROW
                      ? (selectedMarketData?.totalBorrowFiat as number)
                      : (selectedMarketData?.totalSupplyFiat as number)
                  ),
                  Math.round(
                    info === INFO.BORROW ? borrowCapAsFiat : supplyCapAsFiat
                  )
                )}
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
                  {info === INFO.BORROW ? totalBorrows : totalSupplied}{' '}
                  {selectedSymbol}
                </p>
                <p className={`font-semibold text-[8px] text-white/30`}>
                  $
                  {millify(
                    Math.round(
                      info === INFO.BORROW
                        ? (selectedMarketData?.totalBorrowFiat as number)
                        : (selectedMarketData?.totalSupplyFiat as number)
                    )
                  )}{' '}
                  of $
                  {millify(
                    Math.round(
                      info === INFO.BORROW ? borrowCapAsFiat : supplyCapAsFiat
                    )
                  )}
                </p>
                {/* this neeeds to be changed */}
              </div>
              <div
                className={`flex flex-col items-start justify-center gap-y-1`}
              >
                <p className={`text-white/60 text-[10px]`}>APR</p>
                <p className={`font-semibold`}>
                  {info === INFO.BORROW ? borrowAPR : availableAPR}%
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
          className={` rounded-xl  md:col-span-2 md:row-span-2 row-start-3 col-span-6 min-h-[40vh] bg-grayone flex flex-col  items-start p-[3%] justify-start`}
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
            <span>
              {' '}
              {availableToSupply &&
                Number(formatEther(availableToSupply?.value))?.toLocaleString(
                  'en-US',
                  {
                    maximumFractionDigits: 7
                  }
                )}{' '}
              {selectedSymbol}
            </span>
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
          {/* <div
            className={`text-white/60 w-full flex items-center justify-between text-[10px] `}
          >
            $
            {selectedMarketData &&
              selectedMarketData?.netSupplyBalanceFiat.toLocaleString('en-US', {
                maximumFractionDigits: 4
              })}
          </div> */}
          <p
            className={`text-white/60 w-full flex items-center justify-between text-sm mt-3`}
          >
            Available to Borrow{' '}
          </p>
          <div
            className={`w-full font-semibold text-lg pt-1 mb-4 flex items-center justify-between `}
          >
            <span>
              {selectedMarketData && comptrollerAddress && chain && (
                <BorrowAmount
                  selectedMarketData={selectedMarketData}
                  comptrollerAddress={comptrollerAddress as Address}
                  chain={Number(chain)}
                />
              )}{' '}
              {selectedSymbol}
            </span>
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
          {/* <div
            className={`text-white/60 w-full flex items-center justify-between text-[10px] `}
          >
            $
            {selectedMarketData &&
              formatUnits(
                selectedMarketData?.underlyingPrice,
                Number(selectedMarketData.underlyingDecimals)
              )}{' '}
            per {selectedSymbol}
          </div> */}
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
          className={` rounded-xl row-start-2 px-[3%] md:col-span-4 col-span-6 min-h-[33vh] bg-grayone flex flex-col gap-3 items-start justify-start`}
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
          comptrollerAddress={comptrollerAddress as Address}
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
