/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';

import dynamic from 'next/dynamic';

import ResultHandler from '../ResultHandler';
import TokenSelector from '../stake/TokenSelector';

interface ISwapTo {
  amount?: string;
  tokenName?: string;
  token?: `0x${string}`;
  headerText?: string;
  tokenSelector?: boolean;
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
  tokenSelector = false,
  tokenArr,
  isLoading,
  footerText
}: ISwapTo) {
  const newRef = useRef(null!);
  const [open, setOpen] = useState<boolean>(false);
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleOutsideClick = (e: any) => {
    //@ts-ignore
    if (newRef.current && !newRef.current?.contains(e?.target)) {
      setOpen(false);
    }
  };
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
          {tokenSelector ? (
            <TokenSelector
              newRef={newRef}
              open={open}
              setOpen={setOpen}
              // chain={+chain}
              tokenArr={tokenArr}
            />
          ) : (
            <>
              {' '}
              <img
                alt="ion logo"
                className={`w-5 h-5 inline-block ml-2`}
                src={`/img/symbols/32/color/${tokenName.toLowerCase()}.png`}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = '/img/logo/ION.png';
                }}
              />
              <button className={` ml-2`}>{tokenName.toUpperCase()}</button>{' '}
            </>
          )}
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
