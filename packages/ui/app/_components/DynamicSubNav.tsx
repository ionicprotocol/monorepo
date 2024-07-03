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

  return (
    <div
      className={`${`${pools[+chainId].bg ?? pools[mode.id].bg} ${
        pools[+chainId].text ?? pools[mode.id].text
      }`} absolute w-full top-full left-0 text-center p-2 text-sm font-medium cursor-pointer`}
      onClick={() => router.push('/points')}
    >
      Hello, {pools[+chainId].name ?? 'Mode'}! Season 2 is LIVE - New
      multipliers, new ways to earn points! See your Season 1 $ION eligibility
      on the Claim page (Open till 6th of July).
    </div>
  );
}

export default dynamic(() => Promise.resolve(DynamicSubNav), { ssr: false });
