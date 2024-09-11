'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { pools } from '@ui/constants/index';

const PoolToggle = ({ chain, pool }: { chain: number; pool: string }) => {
  const pathname = usePathname();
  return (
    <div
      className={`flex items-center justify-start w-max gap-2 sm:mx-0 mx-auto p-2`}
    >
      {pools[+chain].pools.map((poolx, idx) => {
        return (
          <Link
            className={` cursor-pointer  px-4 rounded-md ${
              pool === poolx.id
                ? ` ${pools[+chain].bg} ${pools[+chain].text}`
                : 'bg-black '
            }`}
            href={`${pathname}?chain=${chain}${
              poolx.id ? `&pool=${poolx.id}` : ''
            }`}
            key={idx}
          >
            {poolx.name}
          </Link>
        );
      })}
    </div>
  );
};

export default dynamic(() => Promise.resolve(PoolToggle), { ssr: false });
