'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { base } from 'viem/chains';

function DynamicSubNav() {
  const searchParams = useSearchParams();
  const chain = searchParams.get('chain');
  const chainId = chain === null ? 34443 : chain;
  // console.log(chain);

  return (
    <div
      className={`${
        +chainId === base.id ? 'bg-blue-600 text-white' : 'bg-lime text-darkone'
      } absolute w-full top-full left-0 text-center p-2 text-sm font-medium`}
    >
      Hello, {+chainId === base.id ? 'Base' : 'Mode'}! Ionic is open for lending
      and borrowing! Supply assets to earn Ionic points. Borrow to earn
      multiplied points!
    </div>
  );
}

export default dynamic(() => Promise.resolve(DynamicSubNav), { ssr: false });
