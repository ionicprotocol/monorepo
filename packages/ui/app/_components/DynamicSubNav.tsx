'use client';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { mode } from 'viem/chains';

import { pools } from '@ui/constants/index';

function DynamicSubNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chain = searchParams.get('chain');
  const chainId = chain === null ? mode.id : chain;

  function clone() {
    return (
      <div
        className={`thread min-w-max h-max group-hover:pause p-2 text-center animate-slide flex-shrink-0  `}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`pl-14`}
          >
            Hello, {pools[+chainId].name ?? 'Mode'}! OP SuperFest is LIVE,
            supply ETH and/or USDC to get OP rewards on top of the MODE and
            IONIC points!
          </span>
        ))}
      </div>
    );
  }
  return (
    <div
      className={`${`${pools[+chainId].bg ?? pools[mode.id].bg} ${
        pools[+chainId].text ?? pools[mode.id].text
      }`} absolute w-full top-full left-0 text-center  text-sm font-medium cursor-pointer `}
      onClick={() => router.push('/points')}
    >
      <div className={`h-max w-[100vw] flex group  givep overflow-x-hidden`}>
        {clone()}
        {clone()}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(DynamicSubNav), { ssr: false });

{
  /* Hello, {pools[+chainId].name ?? 'Mode'}! Season 2 is LIVE - New
      multipliers, new ways to earn points! See your Season 1 $ION eligibility
      on the Claim page (Open till 6th of July). */
}
