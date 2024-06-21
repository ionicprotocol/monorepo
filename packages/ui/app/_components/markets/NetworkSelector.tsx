/* eslint-disable @next/next/no-img-element */
'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { pools } from '@ui/constants/index';
interface INetworkSelector {
  chainId?: string;
  dropdownSelectedChain: number;
  newRef: any;
  open: boolean;
  setOpen: any;
}

export default function NetworkSelector({
  dropdownSelectedChain,
  setOpen,
  open,
  newRef
}: INetworkSelector) {
  const pathname = usePathname();
  return (
    <div
      className="w-full capitalize text-md  relative font-bold"
      ref={newRef}
    >
      <div
        className={`${pools[dropdownSelectedChain].text} cursor-pointer my-2  w-full   flex  flex-col items-start justify-start order border-b-none border-stone-700  `}
        onClick={() => setOpen((prevState: any) => !prevState)}
      >
        <div
          className={`py-2 px-2 w-full relative items-center border-2 border-stone-700 ${
            pools[dropdownSelectedChain].bg
          } ${open ? 'rounded-t-md' : 'rounded-xl '} ${
            pools[dropdownSelectedChain].text
          }`}
        >
          {pools[dropdownSelectedChain].name ?? 'Select Chain'}
          <img
            alt="expand-arrow--v2"
            className={`w-3 transition-all duration-100 ease-linear absolute right-2 top-1/2 -translate-y-1/2 ${
              open ? 'rotate-180' : 'rotate-0'
            } `}
            src={`https://img.icons8.com/ios/50/${pools[dropdownSelectedChain].arrow}/expand-arrow--v2.png`}
          />
        </div>
        <ul
          className={`  left-0   ${
            open ? 'block' : 'hidden transition-all  delay-1000'
          } top-full w-full  text-lime origin-top z-40 shadow-xl shadow-black/10 rounded-b-md py-2 border border-stone-700 absolute bg-grayone/50 backdrop-blur-sm p-2 `}
        >
          {Object.entries(pools).map(([chainId, network], idx: number) => (
            <Link
              className={`flex justify-between items-center p-2 mb-1 ${network.text} rounded-md ${network.bg}`}
              href={`${pathname}?chain=${chainId}`}
              key={idx}
            >
              {network.name}{' '}
              {dropdownSelectedChain === +chainId && (
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
