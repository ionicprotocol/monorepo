'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Globe, Diamond } from 'lucide-react';

import { pools } from '@ui/constants/index';

const PoolToggle = ({ chain, pool }: { chain: number; pool: string }) => {
  const pathname = usePathname();
  const poolsData = pools[+chain].pools;

  return (
    <div className="h-9 w-fit rounded-lg bg-darktwo border border-white/10 p-0.5">
      <div className="inline-flex items-center h-full gap-1">
        {poolsData.map((poolx, idx) => {
          const isActive = pool === poolx.id;
          const isMain = poolx.name.toLowerCase().includes('main');

          return (
            <Link
              key={idx}
              href={`${pathname}?chain=${chain}${poolx.id ? `&pool=${poolx.id}` : ''}`}
              className={`
                inline-flex items-center gap-2 px-3 h-full rounded-md text-sm font-medium transition-all
                ${
                  isActive
                    ? `${pools[+chain].bg} ${pools[+chain].text}`
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {isMain ? (
                <Globe className="h-4 w-4" />
              ) : (
                <Diamond className="h-4 w-4" />
              )}
              <span className="relative">{isMain ? 'Main' : 'Native'}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(PoolToggle), { ssr: false });
