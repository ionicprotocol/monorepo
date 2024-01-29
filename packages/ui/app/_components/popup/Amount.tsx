/* eslint-disable @next/next/no-img-element */
'use client';
import { MarketData } from '@ui/types/TokensDataMap';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';

interface IAmount {
  selectedMarketData: MarketData;
  handleInput: (val?: number) => void;
  amount?: number;
  hintText?: string;
  max?: number;
  symbol: string;
}
const Amount = ({
  selectedMarketData,
  handleInput,
  amount,
  hintText = 'Wallet Balance',
  max = 0,
  symbol
}: IAmount) => {
  const marketDataDecimals = parseInt(
    selectedMarketData.underlyingDecimals.toString()
  );
  //neeed to get the wallet balance
  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    const currentValue =
      e.target.value.trim() === '' ? undefined : parseFloat(e.target.value);

    handleInput(currentValue && currentValue > max ? max : currentValue);
  }
  function handleMax(val: number) {
    handleInput(val);
  }

  return (
    <div className={`w-full flex-col items-start justify-start`}>
      <div className={`flex w-full items-center text-[10px] text-white/50 `}>
        <span className={``}>Amount</span>
        <span className={`ml-auto`}>
          {hintText} {max.toFixed(marketDataDecimals)}
        </span>
        <button
          onClick={() => handleMax(max)}
          className={`text-accent pl-2`}
        >
          MAX
        </button>
      </div>
      <div
        className={`flex w-full  pt-1.5 items-center text-lg text-white/50 `}
      >
        <input
          defaultValue={amount}
          type="number"
          placeholder="0"
          className={`focus:outline-none amount-field font-bold bg-transparent`}
          onChange={handlInpData}
        />
        <img
          src={`/img/symbols/32/color/${symbol?.toLowerCase()}.png`}
          alt="link"
          className={`h-4 ml-auto`}
        />
        <span className={`text-white pl-2`}>{symbol}</span>
      </div>
    </div>
  );
};

// export default Amount
export default dynamic(() => Promise.resolve(Amount), { ssr: false });
{
  /* <div className={``}></div> */
}
