/* eslint-disable @next/next/no-img-element */
'use client';

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
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { formatEther } from 'viem';
import { useAccount, useChainId } from 'wagmi';

import SliderComponent from 'ui/app/_components/popup/Slider';
import MaxDeposit from 'ui/app/_components/stake/MaxDeposit';
import { donutoptions, getDonutData } from 'ui/app/_constants/mock';

interface IProp {
  params: { tokenaddress: string };
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

export default function Swaps({}: IProp) {
  const [utilization, setUtilization] = useState<number>(0);
  const [swapFromToken, setSwapFromToken] = useState<string>('');
  const [swapToToken, setSwapToToken] = useState<string>('');

  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  const router = useRouter();
  const { isConnected } = useAccount();

  return (
    <div className=" flex flex-col items-start justify-start transition-all duration-200 ease-linear bg-grayone w-[85%] sm:w-[55%] md:w-[45%] mx-auto my-10 rounded-md p-4 gap-y-1 ">
      <div className={` flex items-center justify-between w-full mb-3`}>
        <span className="text-lg font-bold text-white">Switch WETH</span>
        <img
          alt="close"
          className={`absolute top-4 right-4 h-5 w-5 cursor-pointer z-20 opacity-70`}
          onClick={() => router.back()}
          src="/img/assets/back.png"
        />
      </div>
      <div className={` text-xs  flex items-center justify-between w-full`}>
        <span className=" text-white/50 ">CONVERSION RATE</span>
        <span className=" ">0.00%</span>
      </div>
      <div className={` text-xs  flex items-center justify-between w-full`}>
        <span className=" text-white/50 ">FEES</span>
        <span className=" ">84</span>
      </div>
      <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-2.5 " />
      <div className="w-full">
        <MaxDeposit
          headerText={'Wallet Balance'}
          amount={swapFromToken}
          tokenName={'weth'}
          token={'0x4200000000000000000000000000000000000006'}
          handleInput={(val?: string) => setSwapFromToken(val as string)}
          // max="0"
          chain={+chain}
        />
        <MaxDeposit
          headerText={'Wallet Balance'}
          amount={swapToToken}
          tokenName={`usdc`}
          token={'0xd988097fb8612cc24eeC14542bC03424c656005f'}
          handleInput={(val?: string) => setSwapToToken(val as string)}
          chain={+chain}
        />
        <div className={`my-6 w-full`}>
          <SliderComponent
            currentUtilizationPercentage={Number(utilization.toFixed(0))}
            handleUtilization={(val?: number) => {
              if (!val && !isConnected) return;
              const percentval =
                (Number(val) / 100) *
                Number(
                  formatEther(
                    BigInt(swapToToken)
                    // withdrawalMaxToken?.decimals as number
                  )
                );
              setSwapToToken(percentval.toString());
              setUtilization(val ?? 0);
            }}
          />
        </div>
      </div>
      <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-2.5 " />
      <div className={` text-xs  flex items-center justify-between w-full`}>
        <span className=" text-white/50 ">HEALTH FACTOR</span>
        <span className=" ">69</span>
      </div>
      <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-2.5 " />
      <div className={` text-xs  flex items-center justify-between w-full`}>
        <span className=" text-white/50 ">MARKET SUPPLY BALANCE</span>
        <span className=" ">234 {'->'} 648</span>
      </div>
      <div className={` text-xs  flex items-center justify-between w-full`}>
        <span className=" text-white/50 ">COLLATERAL FACTOR</span>
        <span className=" ">545 {'->'} 34</span>
      </div>
      <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-2.5 " />
      <div className={`w-full flex items-center justify-start gap-5`}>
        <div className={` w-14 h-14`}>
          <Doughnut
            data={getDonutData(12343, 12345678)}
            options={donutoptions}
            updateMode="resize"
          />
        </div>

        <div className={`w-[40%] flex gap-5 items-start justify-start `}>
          <div className={`flex flex-col items-start justify-center gap-y-1`}>
            <p className={`text-white/60 text-[10px]`}>TOTAL SUPLIED</p>
            <p className={`font-semibold`}>
              ${1234} of ${12345678}
              {'USDC'}
              {/* above symbol will be changed */}
            </p>
            <p className={`font-semibold text-[8px] text-white/30`}>
              ${1234} of ${12345678}
            </p>
          </div>
        </div>
      </div>
      <div className="h-[2px] w-[95%] mx-auto bg-white/10 my-2.5 " />
      {/* <div className={` text-xs  flex items-center justify-between w-full`}>
        <span className=" text-white/50 ">Slippage</span>
        <span className=" ">0.2%</span>
      </div> */}
      <p className={`text-xs mb-3`}>0.01% Slippage Tolerance</p>
      <button
        className={`bg-accent py-1 px-3 w-full text-sm rounded-md text-black`}
      >
        SWAP TO USDC{' '}
      </button>
    </div>
  );
}

/*
 <div className={``}> </div>
*/
