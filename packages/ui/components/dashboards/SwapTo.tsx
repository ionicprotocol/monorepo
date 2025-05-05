/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';

import ResultHandler from '../ResultHandler';
import TokenSelector from '../stake/TokenSelector';

interface ISwapTo {
  amount?: string;
  tokenName?: string;
  token?: `0x${string}`;
  headerText?: string;
  tokenArr?: string[];
  isLoading: boolean;
  footerText?: string;
}

export interface IBal {
  decimals: number;
  value: bigint;
}

function SwapTo({
  headerText = 'Deposit',
  amount,
  tokenName = 'eth',
  tokenArr,
  isLoading,
  footerText
}: ISwapTo) {
  return (
    <>
      <div
        className={`flex w-full mt-2 items-center justify-between text-[11px] text-white/40`}
      >
        <span>{headerText}</span>
      </div>
      <div
        className={`flex max-w-full mt-0 items-center justify-between text-md gap-x-1 `}
      >
        <ResultHandler isLoading={isLoading}>
          <input
            className={`focus:outline-none amount-field font-bold bg-transparent disabled:text-white/60 flex-auto flex w-full trucnate`}
            placeholder={`0.0`}
            type={isLoading ? 'text' : 'number'}
            value={isLoading ? '...' : amount}
            disabled={true}
          />
        </ResultHandler>
        <div
          className={`ml-auto min-w-max px-0.5 flex items-center justify-end`}
        >
          <TokenSelector
            tokenArr={tokenArr}
            selectedToken={tokenName}
          />
        </div>
      </div>
      <div
        className={`flex w-full items-center justify-between text-[11px] text-white/40`}
      >
        <span>{footerText}</span>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(SwapTo), { ssr: false });
