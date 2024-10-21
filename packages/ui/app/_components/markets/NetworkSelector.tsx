/* eslint-disable @next/next/no-img-element */
'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useStore } from 'ui/store/Store';

import { pools } from '@ui/constants/index';
interface INetworkSelector {
  chain?: string;
  dropdownSelectedChain: number;
  nopool?: boolean;
  enabledChains?: number[];
  upcomingChains?: string[];
}

function NetworkSelector({
  dropdownSelectedChain,
  nopool = false,
  enabledChains,
  chain,
  upcomingChains
}: INetworkSelector) {
  const pathname = usePathname();
  const setDropChain = useStore((state) => state.setDropChain);
  return (
    <div
      className={`  left-0    md:min-w-max w-full  text-lime origin-top   shadow-xl shadow-black/10 rounded-b-md flex flex-wrap gap-x-1  items-center `}
    >
      <Link
        className={`flex justify-start gap-2 items-center p-2 mb-1 text-xs md:text-base w-max text-white rounded-md  ${+chain! === +dropdownSelectedChain ? ' bg-graySelecte bg-grayone' : 'bg-grayon bg-graylite'} border border-gray-800 `}
        href={`${pathname}?chain=${dropdownSelectedChain}${nopool ? '' : '&pool=0'}`}
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
            ? enabledChains?.includes(+chainId) &&
              +chainId !== dropdownSelectedChain
            : +chainId !== dropdownSelectedChain
        )
        .sort((a, b) => {
          const sortingOrder = ['Mode', 'Base', 'Optimism', 'Fraxtal', 'Bob'];
          const indexA = sortingOrder.indexOf(a[1].name);
          const indexB = sortingOrder.indexOf(b[1].name);

          if (indexA === -1 || indexB === -1) {
            return 0; // if the network name is not found, don't change the order
          }
          return indexA - indexB;
        })
        .map(([chainId, network], idx: number) => (
          <Link
            className={`flex flex-wrap justify-start gap-2 items-center p-2 mb-1 text-xs md:text-sm w-max text-white rounded-md   bg-graySelected border border-gray-800 `}
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
      {!!upcomingChains &&
        upcomingChains.map((upcomingChain, idx) => (
          <div
            className={`flex flex-wrap justify-start gap-2 items-center p-2 mb-1 text-xs md:text-sm w-max text-white rounded-md  relative border border-gray-800 `}
            // href={`${pathname}?chain=${dropdownSelectedChain}${nopool ? '' : '&pool=0'}`}
            key={idx}
          >
            <img
              alt="checkmark--v1"
              className={`w-4 h-4 stroke-lime `}
              src={`/img/logo/${upcomingChain.toUpperCase()}.png`}
            />{' '}
            {upcomingChain}
            <div
              className={`absolute   right-0 w-full h-full bg-gray-700/50  `}
            />
          </div>
        ))}
    </div>
  );
}

export default dynamic(() => Promise.resolve(NetworkSelector), { ssr: false });
