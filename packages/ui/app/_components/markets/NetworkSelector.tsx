/* eslint-disable @next/next/no-img-element */
'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { pools } from '@ui/constants/index';
import { useStore } from 'ui/store/Store';
interface INetworkSelector {
  chain?: string;
  dropdownSelectedChain: number;
  newRef: any;
  open: boolean;
  setOpen: any;
  nopool?: boolean;
  enabledChains?: number[];
}

function NetworkSelector({
  dropdownSelectedChain,
  setOpen,
  open,
  newRef,
  nopool = false,
  enabledChains,
  chain
}: INetworkSelector) {
  const pathname = usePathname();
  const setDropChain = useStore((state) => state.setDropChain);
  return (
    // <div
    //   className="w-max capitalize text-md  relative font-bold"
    //   ref={newRef}
    // >

    //   <div
    //       className={`py-2 px-2 w-full relative items-center border-2 border-stone-700 ${
    //         pools[dropdownSelectedChain].bg
    //       } ${open ? 'rounded-t-md' : 'rounded-xl '} ${
    //         pools[dropdownSelectedChain].text
    //       }`}
    //     >
    //       {pools[dropdownSelectedChain].name ?? 'Select Chain'}
    //       <img
    //         alt="expand-arrow--v2"
    //         className={`w-3 transition-all duration-100 ease-linear absolute right-2 top-1/2 -translate-y-1/2 ${
    //           open ? 'rotate-180' : 'rotate-0'
    //         } `}
    //         src={`https://img.icons8.com/ios/50/${pools[dropdownSelectedChain].arrow}/expand-arrow--v2.png`}
    //       />
    //     </div>
    <div
      className={`  left-0    min-w-max  text-lime origin-top z-40 shadow-xl shadow-black/10 rounded-b-md  px-2 flex gap-x-1  items-center `}
    >
      <Link
        className={`flex justify-start gap-2 items-center p-2 mb-1  w-max text-white rounded-md  ${+chain! === +dropdownSelectedChain ? ' bg-graySelecte bg-grayone' : 'bg-grayon bg-graylite'} border border-gray-800 `}
        href={`${pathname}?chain=${dropdownSelectedChain}${nopool ? '' : '&pool=0'}`}
        // key={idx}
        // onClick={() => setDropChain(chainId)}
      >
        <img
          alt="checkmark--v1"
          className={`w-4 h-4 stroke-lime`}
          src={`/img/logo/${pools[dropdownSelectedChain].name.toUpperCase()}.png`}
        />{' '}
        {pools[dropdownSelectedChain].name}
      </Link>
      {Object.entries(pools)
        .filter(([chainId]) =>
          enabledChains
            ? enabledChains?.includes(+chainId)
            : +chainId !== dropdownSelectedChain
        )
        .map(([chainId, network], idx: number) => (
          <Link
            className={`flex justify-start gap-2 items-center p-2 mb-1  w-max text-white rounded-md   bg-graySelected border border-gray-800 `}
            href={`${pathname}?chain=${chainId}${nopool ? '' : '&pool=0'}`}
            key={idx}
            onClick={() => setDropChain(chainId)}
          >
            <img
              alt="checkmark--v1"
              className={`w-4 h-4 stroke-lime`}
              src={`/img/logo/${network.name.toUpperCase()}.png`}
            />{' '}
            {network.name}
          </Link>
        ))}
    </div>
    // </div>
  );
}

export default dynamic(() => Promise.resolve(NetworkSelector), { ssr: false });
