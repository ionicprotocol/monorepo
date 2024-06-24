/* eslint-disable @next/next/no-img-element */
'use client';

import dynamic from 'next/dynamic';
import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

interface IMaxDeposit {
  amount: string;
  tokenName?: string;
  token?: `0x${string}`;
  handleInput: (val?: string) => void;
}
function MaxDeposit({
  amount,
  tokenName = 'eth',
  token,
  handleInput
}: IMaxDeposit) {
  const { address } = useAccount();
  const hooktoken =
    token === '0x0000000000000000000000000000000000000000' ? undefined : token;
  const { data } = useBalance({
    address,
    token: hooktoken
  });
  // console.log(data);
  function handlInpData(e: React.ChangeEvent<HTMLInputElement>) {
    if (
      data &&
      Number(e.target.value) > Number(formatUnits(data?.value, data?.decimals))
    )
      return;
    handleInput(e.target.value);
  }
  function handleMax(val: string) {
    handleInput(val);
  }
  return (
    <>
      <div
        className={`flex w-full mt-2 items-center justify-between text-[11px] text-white/40`}
      >
        <span> Deposit </span>
        <div>
          {' '}
          {tokenName.toUpperCase()} Balance :{' '}
          {data
            ? parseFloat(
                formatUnits(data?.value, data?.decimals)
              ).toLocaleString('en-US', {
                maximumFractionDigits: 2
              })
            : '0'}
          <button
            className={`text-accent ml-2`}
            onClick={() =>
              handleMax(data ? formatUnits(data?.value, data?.decimals) : '0')
            }
          >
            MAX
          </button>
        </div>
      </div>
      <div className={`flex w-full mt-2 items-center justify-between text-md `}>
        <input
          className={`focus:outline-none amount-field font-bold bg-transparent flex-auto block w-max trucnate`}
          placeholder={`0.0`}
          type="number"
          value={amount}
          onChange={(e) => handlInpData(e)}
        />
        <div className="ml-auto flex items-center justify-center">
          <img
            alt="ion logo"
            className={`w-5 h-5 inline-block ml-4`}
            src={`/img/logo/${tokenName.toUpperCase()}.png`}
          />
          <button className={` mx-2`}>{tokenName.toUpperCase()}</button>
        </div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(MaxDeposit), { ssr: false });
