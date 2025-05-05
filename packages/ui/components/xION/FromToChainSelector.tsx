/* eslint-disable @next/next/no-img-element */
'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect } from 'react';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

import { chainIdToName } from '@ui/constants/index';

interface IChainSelector {
  newRef: any;
  open: boolean;
  setOpen: any;
  // chainArr?: Record<number, string>;
  fromChainId?: number;
  mode?: string;
  // isComingSoon?: boolean;
}

export default function FromTOChainSelector({
  setOpen,
  open,
  newRef,
  // chainArr = { 1: 'eth' },
  fromChainId,
  mode = 'from'
}: IChainSelector) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  //URL passed Data ----------------------------
  const queryChain = searchParams.get('chain');
  const toChain = searchParams.get('toChain');
  const selectedChain = queryChain ?? fromChainId ?? '';
  const selectedToChain = toChain ?? '8453';
  const router = useRouter();

  const fromArr = Object.entries(chainIdToName);
  const toArr = Object.entries(chainIdToName).filter(
    ([key]) => key !== selectedChain
  );
  const createQueryString = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (mode === 'from') {
        selectedToChain === value && params.set('toChain', '');
        params.set('chain', value);
      }

      if (mode === 'toChain') {
        params.set('toChain', value);
      }

      //  params.
      return params.toString();
    },
    [mode, searchParams, selectedToChain]
  );

  const arrofMode = mode === 'toChain' ? toArr : fromArr;

  useEffect(() => {
    if (!queryChain && !toChain) {
      router.push(pathname + '?chain=34443&toChain=8453');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="w-full capitalize text-md  relative font-bold"
      ref={newRef}
    >
      <div
        className={`cursor-pointer my-1  w-full   flex  flex-col items-start justify-start order border-b-none border-stone-700  `}
        onClick={() => setOpen((prevState: any) => !prevState)}
      >
        <div
          className={`py-1.5 pl-3.5 pr-7 w-full gap-1.5 flex relative items-center justify-start border-2 border-stone-700 ${open ? 'rounded-t-md' : 'rounded-xl '} `}
        >
          <img
            alt="symbol"
            className={`w-6 inline-block`}
            src={`/img/logo/${chainIdToName[mode === 'toChain' ? +selectedToChain : +selectedChain]?.toLowerCase() || 'search'}.png`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = '/img/assets/search.png';
            }}
          />
          {chainIdToName[
            mode === 'toChain' ? +selectedToChain : +selectedChain
          ] ?? 'Select Chain'}{' '}
          <img
            alt="expand-arrow--v2"
            className={`w-3 transition-all duration-100 ease-linear absolute right-2 top-1/2 -translate-y-1/2 ${
              open ? 'rotate-180' : 'rotate-0'
            } `}
            src={`https://img.icons8.com/ios/50/ffffff/expand-arrow--v2.png`}
          />
        </div>
        <ul
          className={`  left-0   ${
            open ? 'block' : 'hidden transition-all  delay-1000'
          } top-full w-full  origin-top z-40 shadow-xl shadow-black/10 rounded-b-md py-2 border border-stone-700 absolute bg-grayone/50 backdrop-blur-sm p-1.5 gap-2 `}
        >
          {arrofMode.map((chainslist: [string, string], idx: number) => (
            <Link
              className={`flex justify-start gap-2 items-center p-2 mb-1  rounded-md`}
              href={pathname + '?' + createQueryString(chainslist[0])}
              key={idx}
            >
              {chainslist[1]}
              {'  '}
              {chainIdToName[
                mode === 'toChain' ? +selectedToChain : +selectedChain
              ] === chainslist[0] ? (
                <img
                  alt="checkmark--v1"
                  className={`w-4 h-4 stroke-lime ml-auto`}
                  src="https://img.icons8.com/ios-filled/50/ffffff/checkmark--v1.png"
                />
              ) : (
                <img
                  alt="logos"
                  className={`w-4 h-4 ml-auto`}
                  src={`/img/logo/${chainslist?.[1]?.toLowerCase()}.png`}
                />
              )}
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
