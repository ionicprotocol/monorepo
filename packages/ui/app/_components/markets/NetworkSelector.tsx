'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */

import Link from 'next/link';
import React from 'react';
import { useAccount } from 'wagmi';

interface INetworkSelector {
  chainId?: string;
  newRef: any;
  open: boolean;
  setOpen: any;
}

export default function NetworkSelector({
  setOpen,
  open,
  newRef
}: INetworkSelector) {
  const { chain } = useAccount();

  const networkOptions = [
    {
      chain: 34443,
      name: 'Mode'
    },
    {
      chain: 8453,
      name: 'Base'
    }
  ];

  return (
    <div
      className="w-full capitalize text-sm  relative  "
      ref={newRef}
    >
      <div
        className={`   text-darkone cursor-pointer my-2  w-full   flex  flex-col items-start justify-start order border-b-none border-stone-700  `}
        onClick={() => setOpen((prevState: any) => !prevState)}
      >
        <div
          className={`py-2 px-2 w-full relative items-center ${
            chain?.id === 8453 ? 'bg-blue-600 text-white' : 'bg-lime'
          } ${open ? 'rounded-t-md' : 'rounded-xl'}  `}
        >
          {chain?.id ? chain.name : 'Select Chain'}
          <img
            alt="expand-arrow--v2"
            className={`w-3 transition-all duration-100 ease-linear absolute right-2 top-1/2 -translate-y-1/2 ${
              open ? 'rotate-180' : 'rotate-0'
            } `}
            src={`https://img.icons8.com/ios/50/${
              chain?.id === 8453 ? 'ffffff' : '000000'
            }/expand-arrow--v2.png`}
          />
        </div>
        <ul
          className={`  left-0   ${
            open ? 'block' : 'hidden transition-all  delay-1000'
          } top-full w-full  text-lime origin-top z-40 shadow-xl shadow-black/10 rounded-b-md py-2 border border-stone-700 absolute bg-grayone/50 backdrop-blur-sm p-2 `}
        >
          {networkOptions.map((network: any, idx: number) => (
            <Link
              className={`flex justify-between items-center p-2 mb-1 text-black rounded-md ${
                network.chain === 8453
                  ? 'bg-blue-600  text-white '
                  : ' bg-lime '
              }`}
              href={`/market?chain=${network.chain}`}
              key={idx}
            >
              {network.name}{' '}
              {chain?.id == network.chain && (
                <img
                  alt="checkmark--v1"
                  className={`w-4 h-4 stroke-lime`}
                  src="https://img.icons8.com/ios-filled/50/000000/checkmark--v1.png"
                />
              )}
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
