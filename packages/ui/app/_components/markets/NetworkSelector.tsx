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

  const chainColors = (chainId?: number) => {
    if (chainId === 34443) {
      return { arrow: '000000', bg: 'bg-lime', text: 'text-darkone' };
    }
    if (chainId === 8453) {
      return { arrow: 'ffffff', bg: 'bg-blue-600', text: 'text-white' };
    }
    return { arrow: 'ffffff', bg: 'bg-primary', text: 'text-white' };
  };

  return (
    <div
      className="w-full capitalize text-sm  relative  "
      ref={newRef}
    >
      <div
        className={`   ${
          chainColors(chain?.id).text
        } cursor-pointer my-2  w-full   flex  flex-col items-start justify-start order border-b-none border-stone-700  `}
        onClick={() => setOpen((prevState: any) => !prevState)}
      >
        <div
          className={`py-2 px-2 w-full relative items-center ${
            chainColors(chain?.id).bg
          } ${open ? 'rounded-t-md' : 'rounded-xl'}  `}
        >
          {chain?.id ? chain.name : 'Select Chain'}
          <img
            alt="expand-arrow--v2"
            className={`w-3 transition-all duration-100 ease-linear absolute right-2 top-1/2 -translate-y-1/2 ${
              open ? 'rotate-180' : 'rotate-0'
            } `}
            src={`https://img.icons8.com/ios/50/${
              chainColors(chain?.id).arrow
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
              className={`flex justify-between items-center p-2 mb-1 ${
                chainColors(network.chain).text
              } rounded-md ${chainColors(network.chain).bg}`}
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
