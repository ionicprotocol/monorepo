/* eslint-disable @next/next/no-img-element */
'use client';
import type { Dispatch, SetStateAction } from 'react';
import React from 'react';

import ConnectButton from '../ConnectButton';
import { PopupMode } from '../popup/page';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

interface IRows {
  asset: string;
  borrowAPR: string;
  borrowBalance: string;
  logo: string;
  membership: boolean;
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
  membership,
  totalBorrowing,
  supplyAPR,
  borrowAPR,
  logo,
  setSelectedSymbol,
  setPopupMode
}: IRows) => {
  const { address } = useMultiIonic();

  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 lg:grid  grid-cols-18  py-4 text-xs text-white/80 font-semibold lg:text-center items-center relative ${
        membership && 'border border-lime'
      }`}
    >
      {membership && (
        <span className="absolute top-[-9px] right-[-15px] px-2 text-darkone bg-lime rounded-lg">
          Collateral
        </span>
      )}

      <div
        className={`col-span-2 flex justify-center items-center mb-2 lg:mb-0  flex gap-2 items-center justify-center  `}
      >
        <img
          alt={asset}
          className="h-7"
          src={logo}
        />
        <h3 className={` `}>{asset}</h3>
      </div>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          SUPPLY BALANCE:
        </span>
        {supplyBalance}
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          TOTAL SUPPLIED:
        </span>
        {totalSupplied}
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          BORROW BALANCE:
        </span>
        {borrowBalance}
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          TOTAL BORROWING:
        </span>
        {totalBorrowing}
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          SUPPLY APR:
        </span>
        <div className="popover-container relative flex lg:flex-col items-center">
          {supplyAPR}
          <span className="text-darkone bg-lime rounded-lg w-20 ml-1 lg:ml-0 text-center">
            + POINTS
          </span>
          <div className="popover absolute top-full p-2 mt-1 border border-lime rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all">
            Supply to earn Ionic points
          </div>
        </div>
      </h3>
      <h3
        className={` col-span-2 flex lg:block justify-center items-center mb-2 lg:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          BORROW APR:
        </span>
        <div className="popover-container flex lg:flex-col items-center">
          {borrowAPR}
          <span className="text-darkone bg-lime rounded-lg w-20 ml-1 lg:ml-0 text-center">
            + POINTS
          </span>
          <div className="popover absolute top-full p-2 mt-1 border border-lime rounded-lg text-xs z-30 opacity-0 invisible bg-grayUnselect transition-all">
            Borrow to earn Ionic points
          </div>
        </div>
      </h3>
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
              className={`rounded-lg bg-lime text-black py-1.5 px-3 uppercase`}
              onClick={() => {
                setSelectedSymbol(asset);
                setPopupMode(PopupMode.BORROW);
              }}
            >
              Borrow / Repay
            </button>
          </>
        ) : (
          <div className="connect-button">
            <ConnectButton size="sm" />
          </div>
        )}
      </div>
      {/* <Link
        href={`/market/details/${asset}`}
        className={` w-[50%] mx-auto col-span-2 flex lg:block justify-center items-center rounded-lg border text-white border-white py-1.5 `}
      >
        Details
      </Link> */}
    </div>
  );
};

export default PoolRows;
