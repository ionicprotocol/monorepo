'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

import { mode } from 'viem/chains';

import { pools } from '@ui/constants/index';

function DynamicSubNav() {
  // const router = useRouter();
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
            veION COMING SOON! Supply & Borrow Assets to earn $ION. Accumulate &
            Lock $ION to increase Emissions to your favorite Assets and Maximize
            Yields!
          </span>
        ))}
      </div>
    );
  }
  return (
    <a
      className={`${`${pools[+chainId]?.bg ?? pools[mode.id]?.bg} ${
        pools[+chainId]?.text ?? pools[mode.id]?.text
      }`} absolute w-full z-20 top-full left-0 text-center  text-sm font-medium cursor-pointer `}
      // onClick={() => router.push('/points')}
      href="https://jumper.exchange/superfest/"
      target="_blank"
    >
      <div className={`h-max w-full flex group z-20 givep overflow-x-hidden`}>
        {clone()}
        {clone()}
      </div>
    </a>
  );
}

export default dynamic(() => Promise.resolve(DynamicSubNav), { ssr: false });

{
  /* Hello, {pools[+chainId].name ?? 'Mode'}! Season 2 is LIVE - New
      multipliers, new ways to earn points! See your Season 1 $ION eligibility
      on the Claim page (Open till 6th of July). */
}
