/* eslint-disable @next/next/no-img-element */
'use client';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

import ResultHandler from '../ResultHandler';

import type { MarketData } from '@ui/types/TokensDataMap';
import { parseUnits } from 'viem';

interface IAmount {
  amount?: string;
  availableAssets?: MarketData[];
  handleInput: (val?: string) => void;
  hintText?: string;
  isLoading?: boolean;
  mainText?: string;
  max?: string;
  readonly?: boolean;
  selectedMarketData: MarketData;
  setSelectedAsset?: (asset: MarketData) => void;
  symbol: string;
}

const Amount = ({
  selectedMarketData,
  handleInput,
  amount,
  availableAssets,
  hintText = 'Wallet Balance',
  mainText = 'Amount',
  max = '0',
  symbol,
  isLoading = false,
  readonly,
  setSelectedAsset
}: IAmount) => {
  const [availableAssetsOpen, setAvailableAssetsOpen] =
    useState<boolean>(false);

  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    const currentValue = e.target.value.trim();
    let newAmount = currentValue === '' ? undefined : currentValue;
    const numbersBeforeSeparator = new RegExp(/[0-9]\./gm).test(
      currentValue ?? ''
    )
      ? 1
      : 0;

    if (
      newAmount &&
      newAmount.length > 1 &&
      newAmount[0] === '0' &&
      newAmount[1] !== '.'
    ) {
      newAmount = newAmount.slice(1, newAmount.length);
    }

    if (
      newAmount &&
      newAmount.length >
        selectedMarketData.underlyingDecimals + 1 + numbersBeforeSeparator
    ) {
      return;
    }

    if (
      newAmount &&
      parseUnits(max, selectedMarketData.underlyingDecimals) <
        parseUnits(newAmount, selectedMarketData.underlyingDecimals)
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
    <div className={`relative w-full flex-col items-start justify-start`}>
      <div className={`flex w-full items-center text-[10px] text-white/50 `}>
        <span className={``}>{mainText}</span>

        {!readonly && (
          <div className="ml-auto">
            <ResultHandler
              height="15"
              isLoading={isLoading}
              width="15"
            >
              <>
                <span className={`ml-auto`}>
                  {hintText} {max}
                </span>
                <button
                  className={`text-accent pl-2`}
                  onClick={() => handleMax(max)}
                >
                  MAX
                </button>
              </>
            </ResultHandler>
          </div>
        )}
      </div>
      <div
        className={`relative flex w-full  pt-1.5 items-center text-lg text-white/50 justify-between`}
      >
        <input
          className={`focus:outline-none amount-field font-bold bg-transparent flex-auto block w-full`}
          onChange={handlInpData}
          placeholder={`${selectedMarketData.underlyingSymbol} Amount`}
          readOnly={!!readonly}
          type="number"
          value={amount}
        />

        <div
          className="relative flex items-center cursor-pointer grow-0 shrink-0"
          onClick={() => setAvailableAssetsOpen(!availableAssetsOpen)}
        >
          <img
            alt="link"
            height="20"
            src={`/img/symbols/32/color/${symbol?.toLowerCase()}.png`}
            width="20"
          />
          <span className={`text-white pl-2`}>{symbol}</span>

          {availableAssets && (
            <img
              alt="link"
              height="24"
              src={`/images/chevron-down.png`}
              width="24"
            />
          )}
        </div>

        {availableAssets && (
          <div
            className={`absolute w-[180px] top-full right-0 px-4 py-3 origin-top-right rounded-lg bg-grayone transition-all ${
              availableAssetsOpen
                ? 'visible opacity-100 scale-100 '
                : 'opacity-0 scale-90 invisible'
            }`}
          >
            {availableAssets.map((asset) => (
              <div
                className="flex py-1 items-center font-bold text-white cursor-pointer"
                key={`asset-${asset.underlyingSymbol}`}
                onClick={() => {
                  setSelectedAsset && setSelectedAsset(asset);
                  setAvailableAssetsOpen(false);
                }}
              >
                <img
                  alt="link"
                  height="20"
                  src={`/img/symbols/32/color/${asset.underlyingSymbol?.toLowerCase()}.png`}
                  width="20"
                />
                <span className={`text-white pl-2`}>
                  {asset.underlyingSymbol}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// export default Amount
export default dynamic(() => Promise.resolve(Amount), { ssr: false });
{
  /* <div className={``}></div> */
}
