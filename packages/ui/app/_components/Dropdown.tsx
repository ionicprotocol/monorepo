/* eslint-disable @next/next/no-img-element */
'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface Idropdown {
  chainId?: string;
  dropdownSelectedChain: number;
  newRef: any;
  open: boolean;
  options: Ioptions[];
  pool?: string;
  setOpen: any;
}
interface Ioptions {
  chain: number;
  id?: string;
  name: string;
}
export default function Dropdown({
  dropdownSelectedChain,
  setOpen,
  open,
  options,
  pool,
  newRef
}: Idropdown) {
  const chainColors = (chainId?: number) => {
    if (chainId === 34443) {
      return { arrow: '000000', bg: 'bg-lime', text: 'text-darkone' };
    }
    if (chainId === 8453) {
      return { arrow: 'ffffff', bg: 'bg-blue-600', text: 'text-white' };
    }
    return { arrow: 'ffffff', bg: 'bg-primary', text: 'text-white' };
  };

  const filtered = options.filter(
    (chainsobj) => dropdownSelectedChain === chainsobj.chain
  );

  const displayfirst = filtered.find(
    (obj) => pool === obj.id && dropdownSelectedChain === obj.chain
  );
  const pathname = usePathname();
  // console.log(filtered, displayfirst, pool);
  return (
    <div
      className="w-full capitalize text-md  relative font-bold"
      ref={newRef}
    >
      <div
        className={`   ${
          chainColors(dropdownSelectedChain).text
        } cursor-pointer my-2  w-full   flex  flex-col items-start justify-start order border-b-none border-stone-700  `}
        onClick={() => setOpen((prevState: any) => !prevState)}
      >
        <div
          className={`py-2 px-2 w-full relative items-center border-2 border-stone-700 ${
            chainColors(dropdownSelectedChain).bg
          } ${open ? 'rounded-t-md' : 'rounded-xl '} ${
            chainColors(dropdownSelectedChain).text
          }`}
        >
          {/* {dropdownSelectedChain === networkOptions[1].chain
            ? 'Base'
            : dropdownSelectedChain === networkOptions[0].chain
            ? 'Mode'
            : 'Select Chain'} */}
          {pathname === '/market'
            ? filtered.find((obj) => dropdownSelectedChain === obj.chain)?.name
            : displayfirst?.name}

          <img
            alt="expand-arrow--v2"
            className={`w-3 transition-all duration-100 ease-linear absolute right-2 top-1/2 -translate-y-1/2 ${
              open ? 'rotate-180' : 'rotate-0'
            } `}
            src={`https://img.icons8.com/ios/50/${
              chainColors(dropdownSelectedChain).arrow
            }/expand-arrow--v2.png`}
          />
        </div>
        <ul
          className={`  left-0   ${
            open ? 'block' : 'hidden transition-all  delay-1000'
          } top-full w-full  text-lime origin-top z-40 shadow-xl shadow-black/10 rounded-b-md py-2 border border-stone-700 absolute bg-grayone/50 backdrop-blur-sm p-2 `}
        >
          {options.map((network: any, idx: number) => (
            <Link
              className={`flex justify-between items-center p-2 mb-1 ${
                chainColors(network.chain).text
              } rounded-md ${chainColors(network.chain).bg}`}
              href={`${pathname}?chain=${network.chain}${
                network.id ? `&pool=${network.id}` : ''
              }`}
              key={idx}
            >
              {network.name}{' '}
              {pathname === '/market' &&
                dropdownSelectedChain === network.chain && (
                  <img
                    alt="checkmark--v1"
                    className={`w-4 h-4 stroke-lime`}
                    src="https://img.icons8.com/ios-filled/50/000000/checkmark--v1.png"
                  />
                )}
              {pathname === '/dashboard' &&
                displayfirst?.name === network.name && (
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
