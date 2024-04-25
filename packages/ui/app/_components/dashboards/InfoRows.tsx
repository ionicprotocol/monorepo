/* eslint-disable @next/next/no-img-element */
'use client';
import type { Dispatch, SetStateAction } from 'react';

import { getAssetName } from '../../util/utils';
import { PopupMode } from '../popup/page';

export enum InfoMode {
  SUPPLY,
  BORROW
}

export type InfoRowsProps = {
  amount: string;
  apr: string;
  asset: string;
  collateralApr: string;
  logo: string;
  membership: boolean;
  mode: InfoMode;
  setPopupMode: Dispatch<SetStateAction<PopupMode | undefined>>;
  setSelectedSymbol: Dispatch<SetStateAction<string | undefined>>;
  utilization: string;
};

const InfoRows = ({
  amount,
  asset,
  logo,
  membership,
  mode,
  setSelectedSymbol,
  setPopupMode,
  apr
}: InfoRowsProps) => {
  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 lg:grid  grid-cols-5  py-4 text-xs text-white/80 font-semibold text-center items-center relative ${
        membership && 'border border-lime'
      }`}
    >
      {membership && (
        <span className="absolute top-[-9px] right-[-15px] px-2 text-darkone bg-lime rounded-lg">
          Collateral
        </span>
      )}

      <div className={`  flex gap-2 items-center justify-center mb-2 lg:mb-0`}>
        <img
          alt={asset}
          className="h-7"
          src={logo}
        />
        <h3 className={` `}>{getAssetName(asset)}</h3>
      </div>
      <h3 className={`mb-2 lg:mb-0`}>
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          AMOUNT:
        </span>
        {amount}
      </h3>
      <h3 className={`mb-2 lg:mb-0`}>
        <span className="text-white/40 font-semibold mr-2 lg:hidden text-right">
          {mode === InfoMode.SUPPLY ? 'SUPPLY' : 'BORROW'} APR:
        </span>
        {apr}
      </h3>
      <div className={` col-span-2 flex items-center justify-center gap-3`}>
        <button
          className={`w-full uppercase rounded-lg bg-accent text-black py-1.5 px-3`}
          onClick={() => {
            setSelectedSymbol(asset);
            setPopupMode(
              mode === InfoMode.SUPPLY ? PopupMode.WITHDRAW : PopupMode.REPAY
            );
          }}
        >
          {mode === InfoMode.SUPPLY ? 'Withdraw' : 'Repay'}
        </button>

        <button
          className={`w-full uppercase bg-lime rounded-lg text-black py-1.5 px-3`}
          onClick={() => {
            setSelectedSymbol(asset);
            setPopupMode(
              mode === InfoMode.SUPPLY ? PopupMode.SUPPLY : PopupMode.BORROW
            );
          }}
        >
          {mode === InfoMode.SUPPLY ? 'Add Collateral' : 'Borrow More'}
        </button>
      </div>
    </div>
  );
};

export default InfoRows;
