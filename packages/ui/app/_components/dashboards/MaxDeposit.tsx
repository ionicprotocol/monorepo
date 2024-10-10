/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import type { Dispatch, SetStateAction } from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { formatUnits, parseUnits } from 'viem';
// import { mode } from 'viem/chains';
import { useAccount, useBalance } from 'wagmi';

import TokenSelector from '../stake/TokenSelector';

interface IMaxDeposit {
  amount?: string;
  tokenName?: string;
  token?: `0x${string}`;
  handleInput?: (val?: string) => void;
  fetchOwn?: boolean;
  headerText?: string;
  max?: string;
  chain: number;
  tokenSelector?: boolean;
  tokenArr?: string[];
  setMaxTokenForUtilization?: Dispatch<SetStateAction<IBal>>;
  exchangeRate?: bigint;
}

export interface IBal {
  decimals: number;
  value: bigint;
}

function MaxDeposit({
  headerText = 'Deposit',
  amount,
  tokenName = 'eth',
  token,
  handleInput,
  fetchOwn = false,
  max = '',
  chain,
  tokenSelector = false,
  tokenArr,
  setMaxTokenForUtilization,
  exchangeRate
}: IMaxDeposit) {
  const [bal, setBal] = useState<IBal>();

  const { address } = useAccount();
  const hooktoken =
    token === '0x0000000000000000000000000000000000000000' ? undefined : token;

  const { data } = useBalance({
    address,
    token: hooktoken,
    chainId: chain,
    query: {
      refetchInterval: 5000
    }
  });

  useMemo(() => {
    if (max) {
      setBal({
        value: parseUnits(max, data?.decimals ?? 18),
        decimals: data?.decimals ?? 18
      });
      // setMaxTokenForUtilization &&
      //   setMaxTokenForUtilization({
      //     value: parseUnits(max, data?.decimals ?? 18),
      //     decimals: data?.decimals ?? 18
      //   });
    } else if (max == '0') {
      setBal({ value: BigInt(0), decimals: data?.decimals ?? 18 });
      // setMaxTokenForUtilization &&
      //   setMaxTokenForUtilization({
      //     value: BigInt(0),
      //     decimals: data?.decimals ?? 18
      //   });
    } else {
      data && setBal({ value: data?.value, decimals: data?.decimals });
    }
  }, [data, max]);
  // console.log(data);
  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    if (
      bal &&
      Number(e.target.value) > Number(formatUnits(bal?.value, bal?.decimals))
    )
      return;
    if (!handleInput) return;
    handleInput(e.target.value);
  }
  function handleMax(val: string) {
    if (!handleInput) return;
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
            ? parseFloat(
                formatUnits(
                  exchangeRate
                    ? (bal?.value * exchangeRate) / 10n ** BigInt(bal?.decimals)
                    : bal?.value,
                  bal?.decimals
                )
              ).toLocaleString('en-US', {
                maximumFractionDigits: 3
              })
            : max}
          {handleInput && (
            <button
              className={`text-accent ml-2`}
              onClick={() => {
                handleMax(bal ? formatUnits(bal?.value, bal?.decimals) : max);
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
                  formatUnits(
                    exchangeRate
                      ? (bal?.value * exchangeRate) /
                          10n ** BigInt(bal?.decimals)
                      : bal?.value,
                    bal?.decimals
                  )
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
    </>
  );
}

export default dynamic(() => Promise.resolve(MaxDeposit), { ssr: false });
