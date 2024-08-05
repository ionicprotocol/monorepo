/* eslint-disable @next/next/no-img-element */
'use client';
import type { Dispatch, SetStateAction } from 'react';
import type { Address } from 'viem';

import { getAssetName } from '../../util/utils';
import { Rewards } from '../markets/Rewards';
import { PopupMode } from '../popup/page';

import { multipliers } from '@ui/utils/multipliers';

export enum InfoMode {
  SUPPLY,
  BORROW
}

export type InfoRowsProps = {
  amount: string;
  apr: string;
  asset: string;
  collateralApr: string;
  cToken: string;
  logo: string;
  pool: string;
  membership: boolean;
  mode: InfoMode;
  comptrollerAddress: Address;
  selectedChain: number;
  setPopupMode: Dispatch<SetStateAction<PopupMode | undefined>>;
  setSelectedSymbol: Dispatch<SetStateAction<string>>;
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
  apr,
  selectedChain,
  cToken,
  comptrollerAddress,
  pool
}: InfoRowsProps) => {
  return (
    <div
      className={`w-full hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 md:grid  grid-cols-6  py-4 text-xs text-white/80 font-semibold text-center items-center relative ${
        membership && 'border border-lime'
      }`}
    >
      {membership && (
        <span className="absolute top-[-9px] right-[-15px] px-2 text-darkone bg-lime rounded-lg">
          Collateral
        </span>
      )}

      <div
        className={`  flex gap-2 items-center justify-start md:justify-center text-xl md:text-base mb-4 md:mb-2 lg:mb-0 `}
      >
        <img
          alt={asset}
          className="w-10 md:w-7"
          src={logo}
        />
        <h3 className={`  text-lg md:text-sm  `}>
          {getAssetName(asset, selectedChain)}
        </h3>
      </div>
      <h3
        className={` flex justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2  md:hidden text-left">
          AMOUNT:
        </span>
        {amount}
      </h3>
      <h3
        className={` flex justify-between md:justify-center  px-2 md:px-0 items-center mb-2 md:mb-0`}
      >
        <span className="text-white/40 font-semibold mr-2 md:hidden text-left">
          {mode === InfoMode.SUPPLY ? 'SUPPLY' : 'BORROW'} APR:
        </span>
        {apr}
      </h3>
      {multipliers[selectedChain]?.[pool]?.[asset]?.borrow?.flywheel &&
      mode == InfoMode.BORROW ? (
        <Rewards
          cToken={cToken as `0x${string}`}
          pool={comptrollerAddress}
          poolChainId={selectedChain}
          type="borrow"
          className="items-center justify-center"
        />
      ) : multipliers[selectedChain]?.[pool]?.[asset]?.supply?.flywheel &&
        mode == InfoMode.SUPPLY ? (
        <Rewards
          cToken={cToken as `0x${string}`}
          pool={comptrollerAddress}
          poolChainId={selectedChain}
          type="supply"
          className="items-center justify-center"
        />
      ) : (
        <div />
      )}
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
