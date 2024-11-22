import React from 'react';

import Image from 'next/image';

import { type Address } from 'viem';

import type { MarketData } from '@ui/types/TokensDataMap';

import ResultHandler from '../ResultHandler';

export type LoopProps = {
  borrowableAssets: Address[];
  closeLoop: () => void;
  comptrollerAddress: Address;
  currentBorrowAsset?: MarketData;
  isOpen: boolean;
  selectedCollateralAsset: MarketData;
};

type LoopInfoDisplayProps = {
  aprPercentage?: string;
  aprText?: string;
  isLoading: boolean;
  nativeAmount: string;
  symbol: string;
  title: string;
  usdAmount: string;
};

function LoopInfoDisplay({
  aprText,
  aprPercentage,
  isLoading,
  nativeAmount,
  symbol,
  title,
  usdAmount
}: LoopInfoDisplayProps) {
  return (
    <div className="min-h-max shrink-0 basis-[45%]">
      <div className="text-lg font-bold color-white">{title}</div>

      <div className="flex justify-between items-start mb-1">
        <div className="text-white/50 text-xs">
          <ResultHandler
            height="44"
            isLoading={isLoading}
            width="44"
          >
            <span className="block font-bold text-lg">{nativeAmount}</span> $
            {usdAmount}
          </ResultHandler>
        </div>

        <div className="flex items-center font-bold">
          <Image
            alt=""
            className="mr-2"
            height="20"
            src={`/img/symbols/32/color/${symbol.toLowerCase()}.png`}
            width="20"
          />

          {symbol}
        </div>
      </div>

      {aprText && aprPercentage && (
        <div className="flex justify-between items-center">
          <span className="hint-text-uppercase">{aprText}</span>

          <ResultHandler
            height="24"
            isLoading={isLoading}
            width="24"
          >
            <span className="font-bold">{aprPercentage}</span>
          </ResultHandler>
        </div>
      )}
    </div>
  );
}

export default LoopInfoDisplay;
