/* eslint-disable @next/next/no-img-element */
'use client';
import { MarketData } from '@ui/types/TokensDataMap';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import ResultHandler from '../ResultHandler';
import { parseUnits } from 'ethers/lib/utils.js';

interface IAmount {
  selectedMarketData: MarketData;
  handleInput: (val?: string) => void;
  amount?: string;
  hintText?: string;
  max?: string;
  symbol: string;
  isLoading?: boolean;
}
const Amount = ({
  selectedMarketData,
  handleInput,
  amount,
  hintText = 'Wallet Balance',
  max = '0',
  symbol,
  isLoading = false
}: IAmount) => {
  const marketDataDecimals = parseInt(
    selectedMarketData.underlyingDecimals.toString()
  );
  //neeed to get the wallet balance
  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    const currentValue = e.target.value.trim();
    const newAmount = currentValue === '' ? undefined : currentValue;

    if (newAmount && newAmount.length > 20) {
      return;
    }

    if (
      newAmount &&
      parseUnits(max, selectedMarketData.underlyingDecimals).lt(
        parseUnits(newAmount, selectedMarketData.underlyingDecimals)
      )
    ) {
      handleInput(max);

      return;
    }

    handleInput(newAmount);
  }
  function handleMax(val: string) {
    handleInput(val);
  }

  return (
    <div className={`w-full flex-col items-start justify-start`}>
      <div className={`flex w-full items-center text-[10px] text-white/50 `}>
        <span className={``}>Amount</span>
        <div className="ml-auto">
          <ResultHandler
            width="15"
            height="15"
            isLoading={isLoading}
          >
            <>
              <span className={`ml-auto`}>
                {hintText} {max}
              </span>
              <button
                onClick={() => handleMax(max)}
                className={`text-accent pl-2`}
              >
                MAX
              </button>
            </>
          </ResultHandler>
        </div>
      </div>
      <div
        className={`flex w-full  pt-1.5 items-center text-lg text-white/50 `}
      >
        <input
          value={amount}
          type="number"
          placeholder={`${selectedMarketData.underlyingSymbol} Amount`}
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
