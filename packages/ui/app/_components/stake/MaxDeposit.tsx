/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo, useEffect, useRef } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import TokenSelector from './TokenSelector';

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
}

interface IBal {
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
  tokenSelector = false
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
      refetchInterval: 6000
    }
  });

  useMemo(() => {
    if (max) {
      setBal({
        value: BigInt(parseFloat(max) * 10 ** 18),
        decimals: 18
      });
    } else if (max == '0') {
      setBal({ value: BigInt(0), decimals: 0 });
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
          {tokenName.toUpperCase()} Balance :{' '}
          {bal
            ? parseFloat(formatUnits(bal?.value, bal?.decimals)).toLocaleString(
                'en-US',
                {
                  maximumFractionDigits: 3
                }
              )
            : max}
          {handleInput && (
            <button
              className={`text-accent ml-2`}
              onClick={() =>
                handleMax(bal ? formatUnits(bal?.value, bal?.decimals) : max)
              }
            >
              MAX
            </button>
          )}
        </div>
      </div>
      <div
        className={`flex w-full mt-2 items-center justify-between text-md gap-x-1 `}
      >
        <input
          className={`focus:outline-none amount-field font-bold bg-transparent disabled:text-white/60 flex-auto block w-min trucnate`}
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
        <div className="ml-auto flex items-center md:w-[70%] w-full justify-end">
          {tokenSelector ? (
            <TokenSelector
              newRef={newRef}
              open={open}
              setOpen={setOpen}
              chain={+chain}
            />
          ) : (
            <>
              {' '}
              <img
                alt="ion logo"
                className={`w-5 h-5 inline-block ml-4`}
                src={`/img/logo/${tokenName.toUpperCase()}.png`}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = '/img/logo/ION.png';
                }}
              />
              <button className={` mx-2`}>{tokenName.toUpperCase()}</button>{' '}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(MaxDeposit), { ssr: false });
