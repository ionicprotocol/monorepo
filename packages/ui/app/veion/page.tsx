/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';

import GetveIon from '../_components/veion/GetveIonPopup';

import { useOutsideClick } from '@ui/hooks/useOutsideClick';

export default function VeIon() {
  const {
    componentRef: getIonRef,
    isopen: isGetIonOpen,
    toggle: toggleGetIon
  } = useOutsideClick();
  return (
    <div className="lg:w-[60%] w-[80%] lg:p-8 p-4 lg:pt-12  text-white bg-grayone rounded-md space-y-6 mx-auto my-6 ">
      <GetveIon
        getIonRef={getIonRef}
        isGetIonOpen={isGetIonOpen}
        toggleGetIon={toggleGetIon}
      />
      <div className="xl:text-xl text-2xl font-semibold flex flex-col gap-2">
        <img
          className={`size-10`}
          src="/img/assets/db.png"
          alt="down-right--v1"
        />
        <div className="flex  items-center gap-1 ">
          Participate in{'  '}
          <span className="text-accent">Emission</span>
        </div>
      </div>
      <main className="h-full text-white/60 grid grid-cols-6 xl:gap-4 gap-3 md:gap-y-7 gap-y-3 *:text-xs ">
        <div className="col-span-2 md:space-y-3  bg-graylite p-2 xl:p-5 rounded-2xl">
          <img
            className={`w-4 h-4`}
            src="https://img.icons8.com/ios/50/ffffff/down-right--v1.png"
            alt="down-right--v1"
          />
          <p className=" text-left text-xs  ">
            Incentive Market on your favourite chain with Liquidity Guages
          </p>
        </div>
        <div className="col-span-2 space-y-3 bg-graylite p-2 xl:p-5 rounded-2xl">
          <img
            className={`w-4 h-4`}
            src="https://img.icons8.com/ios/50/ffffff/down-right--v1.png"
            alt="down-right--v1"
          />
          <p className=" text-left text-xs  ">
            Significantly boost your collateral pool depth with bribes
          </p>
        </div>
        <div className="col-span-2 space-y-3 bg-graylite p-2 xl:p-5 rounded-2xl">
          <img
            className={`w-4 h-4`}
            src="https://img.icons8.com/ios/50/ffffff/down-right--v1.png"
            alt="down-right--v1"
          />
          <p className=" text-left text-xs  ">
            Increase Emissions and earn POL for your Treasury
          </p>
        </div>
        <div className="md:col-span-2 col-span-3 space-y-3 bg-graylite p-5 rounded-2xl">
          <p className="text-xs ">TOTAL LP</p>
          <div className="flex flex-wrap md:gap-3">
            <span className="flex">
              <img
                src="/img/logo/ION.png"
                alt="logo"
                className="size-6 rounded-full"
              />
              <img
                src="/img/logo/ETH.png"
                alt="logo"
                className="size-6 rounded-full -ml-2"
              />
            </span>
            <p className="text-white font-semibold text-md">$1,234,432.21</p>
          </div>
        </div>
        <div className="md:col-span-4 col-span-6  space-y-3 bg-graylite p-5 rounded-2xl">
          <p className="text-xs font-light">PROVIDE LP ON DEX</p>
          <div className="flex  items-center justify-between gap-2 xl:gap-6">
            <span className="flex">
              <img
                src="/img/logo/ION.png"
                alt="logo"
                className="size-6 rounded-full"
              />
              <img
                src="/img/logo/ETH.png"
                alt="logo"
                className="size-6 rounded-full -ml-2"
              />
            </span>
            <p className="text-white font-medium text-md ">ION/WETH</p>
            <button className="bg-green-400 p-2 text-grayUnselect rounded-lg text-xs font-bold tracking-tight flex items-center gap-2">
              Add Liquidity
            </button>
            <p className="text-white font-medium text-md">ION/WETH LP</p>
          </div>
        </div>
        <div className="md:col-span-2  col-span-3 row-start-2 md:row-start-3 space-y-3 bg-graylite p-5 rounded-2xl">
          <p className="text-xs font-light">TOTAL LP LOCKED </p>
          <div className="flex items-center flex-wrap  gap-3">
            <span className="flex ">
              <img
                src="/img/logo/ION.png"
                alt="logo"
                className="h-4 w-4 rounded-full"
              />
              <img
                src="/img/logo/ETH.png"
                alt="logo"
                className="h-4 w-4 rounded-full -ml-2"
              />
            </span>
            <p className="text-white font-semibold text-md">$1,234,432.21</p>
            <img
              className="size-4 inline-block"
              src="https://img.icons8.com/forma-thin/24/ffffff/lock.png"
              alt="lock"
            />
          </div>
        </div>
        <div className="md:col-span-4 col-span-6  space-y-3 bg-graylite p-5 rounded-2xl">
          <p className="text-xs font-light">LOCK YOUR ION LP</p>
          <div className="flex  items-center justify-between gap-2 xl:gap-6">
            <span className="flex">
              <img
                src="/img/logo/ION.png"
                alt="logo"
                className="size-6 rounded-full"
              />
              <img
                src="/img/logo/ETH.png"
                alt="logo"
                className="size-6 rounded-full -ml-2"
              />
            </span>
            <p className="text-white font-medium text-md">ION/WETH</p>
            <button
              onClick={() => toggleGetIon()}
              className="bg-accent p-2 text-grayUnselect rounded-lg text-xs font-bold tracking-tight flex items-center gap-2"
            >
              Lock and get
            </button>
            <p className="text-white font-medium text-md">ION/WETH LP</p>
          </div>
        </div>

        <Link
          href="/veion/governance?watch=myveion"
          className={`col-span-3 bg-accent  space-y-3 text-black hover:-translate-y-1 hover:bg-accent/90 tansition-all duration-100 ease-linear p-5 rounded-2xl md:text-base`}
        >
          My veIon
        </Link>
        <Link
          href="/veion/governance?watch=overview"
          className={`col-span-3 md:text-base bg-accent space-y-3 text-black hover:-translate-y-1 hover:bg-accent/90 tansition-all duration-100 ease-linear p-5 rounded-2xl`}
        >
          veIon Overview
        </Link>
      </main>
    </div>
  );
}