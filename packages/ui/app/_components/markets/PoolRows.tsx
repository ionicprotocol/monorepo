/* eslint-disable @next/next/no-img-element */
'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { Dispatch, SetStateAction } from 'react';
import React from 'react';

import { PopupMode } from '../popup/page';

import { useMultiMidas } from '@ui/context/MultiIonicContext';

interface IRows {
  asset: string;
  borrowAPR: string;
  borrowBalance: string;
  logo: string;
  setPopupMode: Dispatch<SetStateAction<PopupMode | undefined>>;
  setSelectedSymbol: Dispatch<SetStateAction<string | undefined>>;
  supplyAPR: string;
  supplyBalance: string;
  totalBorrowing: string;
  totalSupplied: string;
}
const PoolRows = ({
  asset,
  supplyBalance,
  totalSupplied,
  borrowBalance,
  totalBorrowing,
  supplyAPR,
  borrowAPR,
  logo,
  setSelectedSymbol,
  setPopupMode
}: IRows) => {
  const { address } = useMultiMidas();

  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 grid  grid-cols-18  py-4 text-xs text-white/80 font-semibold text-center items-center `}
    >
      <div className={`col-span-2  flex gap-2 items-center justify-center  `}>
        <img
          alt={asset}
          className="h-7"
          src={logo}
        />
        <h3 className={` `}>{asset}</h3>
      </div>
      <h3 className={` col-span-2`}>{supplyBalance}</h3>
      <h3 className={` col-span-2`}>{totalSupplied}</h3>
      <h3 className={` col-span-2`}>{borrowBalance}</h3>
      <h3 className={` col-span-2`}>{totalBorrowing}</h3>
      <h3 className={` col-span-2`}>{supplyAPR}</h3>
      <h3 className={` col-span-2`}>{borrowAPR}</h3>
      <div className={` col-span-4 flex items-center justify-center gap-3`}>
        {address ? (
          <>
            <button
              className={`rounded-lg bg-accent text-black py-1.5 px-3 uppercase`}
              onClick={() => {
                setSelectedSymbol(asset);
                setPopupMode(PopupMode.SUPPLY);
              }}
            >
              Supply / Withdraw
            </button>
            <button
              className={`rounded-lg border text-white/50 border-white/50 py-1.5 px-3 uppercase opacity-30 pointer-events-none	`}
              // onClick={() => {
              //   setSelectedSymbol(asset);
              //   setPopupMode(PopupMode.BORROW);
              // }}
            >
              Borrow / Repay
            </button>
          </>
        ) : (
          <div className="connect-button">
            <ConnectButton />
          </div>
        )}
      </div>
      {/* <Link
        href={`/market/details/${asset}`}
        className={` w-[50%] mx-auto col-span-2 rounded-lg border text-white border-white py-1.5 `}
      >
        Details
      </Link> */}
    </div>
  );
};

export default PoolRows;
