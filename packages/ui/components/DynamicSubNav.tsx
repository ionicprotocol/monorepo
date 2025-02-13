'use client';

import dynamic from 'next/dynamic';
import { useSearchParams, usePathname } from 'next/navigation';

import { mode, base } from 'viem/chains';

import { pools } from '@ui/constants/index';

export const getBgColor = (pathname: string, chainId: string) => {
  if (pathname === '/earn') {
    return pools[base.id]?.bg;
  }
  return pools[+chainId]?.bg ?? pools[mode.id]?.bg;
};

export const getTextColor = (pathname: string, chainId: string) => {
  if (pathname === '/earn') {
    return pools[base.id]?.text;
  }
  return pools[+chainId]?.text ?? pools[mode.id]?.text;
};

function DynamicSubNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const chain = searchParams.get('chain');
  const chainId = chain === null ? mode.id : chain;

  function clone() {
    return (
      <div className="thread min-w-max h-max group-hover:pause p-2 text-center animate-slide flex-shrink-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className="pl-14"
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
    <div
      className={`${getBgColor(pathname, String(chainId))} ${getTextColor(
        pathname,
        String(chainId)
      )} absolute w-full z-20 top-full left-0 text-center text-sm font-medium`}
    >
      <div className="h-max w-full flex group z-20 givep overflow-x-hidden">
        {clone()}
        {clone()}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(DynamicSubNav), { ssr: false });
