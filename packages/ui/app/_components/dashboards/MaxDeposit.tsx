/* eslint-disable @next/next/no-img-element */
'use client';

import { icErc20Abi } from '@ionicprotocol/sdk';
import dynamic from 'next/dynamic';
import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect, useRef } from 'react';
import { type Address, formatUnits } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import TokenSelector from '../stake/TokenSelector';

interface IMaxDeposit {
  amount: string;
  tokenName: string;
  token: Address;
  handleInput?: (val?: string) => void;
  fetchOwn?: boolean;
  headerText?: string;
  chain: number;
  tokenSelector?: boolean;
  tokenArr?: string[];
  setMaxTokenForUtilization?: Dispatch<SetStateAction<IBal>>;
  exchangeRate?: bigint;
  footerText?: string;
  decimals: number;
}

export interface IBal {
  decimals: number;
  value: bigint;
}

function MaxDeposit({
  headerText,
  amount,
  tokenName,
  token,
  handleInput,
  fetchOwn = false,
  tokenSelector = false,
  tokenArr,
  setMaxTokenForUtilization,
  footerText,
  decimals
}: IMaxDeposit) {
  const [bal, setBal] = useState<IBal>();

  const { address } = useAccount();

  const { data } = useReadContract({
    abi: icErc20Abi,
    address: token,
    functionName: 'balanceOfUnderlying',
    args: [address!]
  });
  const balance = data ?? 0n;

  // const { data } = useBalance({
  //   address,
  //   token,
  //   chainId: chain,
  //   query: {
  //     refetchInterval: 5000
  //   }
  // });

  useEffect(() => {
    setMaxTokenForUtilization &&
      setMaxTokenForUtilization({
        value: balance,
        decimals: decimals ?? 18
      });
    data && setBal({ value: balance, decimals: decimals });
  }, [balance, data, decimals, setMaxTokenForUtilization]);
  // console.log(data);
  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    if (
      bal &&
      Number(e.target.value) > Number(formatUnits(bal.value, bal.decimals))
    )
      return;
    if (!handleInput) return;
    handleInput(e.target.value);
  }
  function handleMax(val?: string) {
    if (!handleInput || !val) return;
    handleInput(val);
  }

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
        className={`flex w-full mt-2 items-center justify-between text-[11px] text-white/40 ${
          !fetchOwn ? 'flex' : 'hidden'
        }`}
      >
        <span>{headerText}</span>
        <div>
          {' '}
          {tokenName?.toUpperCase() ?? ''} Balance :{' '}
          {bal
            ? parseFloat(formatUnits(bal?.value, bal?.decimals)).toLocaleString(
                'en-US',
                {
                  maximumFractionDigits: 3
                }
              )
            : '0'}
          {handleInput && (
            <button
              className={`text-accent ml-2`}
              onClick={() => {
                handleMax(bal ? formatUnits(bal.value, bal.decimals) : '0');
                setMaxTokenForUtilization &&
                  setMaxTokenForUtilization({
                    value: bal?.value ?? BigInt(0),
                    decimals: bal?.decimals ?? 18
                  });
              }}
            >
              MAX
            </button>
          )}
        </div>
      </div>
      <div
        className={`flex max-w-full mt-2 items-center justify-between text-md gap-x-1 `}
      >
        <input
          className={`focus:outline-none amount-field font-bold bg-transparent disabled:text-white/60 flex-auto flex w-full trucnate`}
          placeholder={`0.0`}
          type="number"
          value={
            fetchOwn
              ? bal &&
                parseFloat(
                  formatUnits(bal?.value, bal?.decimals)
                ).toLocaleString('en-US', {
                  maximumFractionDigits: 3
                })
              : amount
          }
          onChange={(e) => handlInpData(e)}
          disabled={handleInput ? false : true}
        />
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
        className={`flex w-full mt-2 items-center justify-between text-[11px] text-white/40`}
      >
        <span>{footerText}</span>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(MaxDeposit), { ssr: false });
