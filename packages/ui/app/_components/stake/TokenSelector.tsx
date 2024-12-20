/* eslint-disable @next/next/no-img-element */
'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useCallback } from 'react';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface ITokenSelector {
  newRef: any;
  open: boolean;
  setOpen: any;
  tokenArr?: string[];
  selectedToken?: string;
}

export default function TokenSelector({
  setOpen,
  open,
  newRef,
  tokenArr = ['eth', 'weth'],
  selectedToken
}: ITokenSelector) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('token', value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div
      className="w-full capitalize text-md relative font-bold"
      ref={newRef}
    >
      <div
        className="cursor-pointer my-1 w-full flex flex-col items-start justify-start border-b-none border-stone-700"
        onClick={() => setOpen((prevState: any) => !prevState)}
      >
        <div
          className={`py-1.5 pl-3.5 pr-9 text-sm w-full gap-1.5 flex relative items-center justify-start border-2 border-stone-700 ${open ? 'rounded-t-md' : 'rounded-xl'}`}
        >
          <img
            alt="symbol"
            className="w-6 inline-block"
            src={`/img/symbols/32/color/${selectedToken?.toLowerCase()}.png`}
          />
          {selectedToken?.toUpperCase() ?? 'Select Token'}
          <img
            alt="expand-arrow--v2"
            className={`w-3 transition-all duration-100 ease-linear absolute right-2 top-1/2 -translate-y-1/2 ${open ? 'rotate-180' : 'rotate-0'}`}
            src="https://img.icons8.com/ios/50/ffffff/expand-arrow--v2.png"
          />
        </div>
        {open && (
          <ul className="left-0 block top-full w-full origin-top z-40 shadow-xl shadow-black/10 rounded-b-md border border-stone-700 absolute bg-grayone/50 backdrop-blur-sm p-1.5 gap-2 max-h-60 overflow-y-auto">
            {tokenArr?.map((token: string, idx: number) => (
              <Link
                key={idx}
                href={pathname + '?' + createQueryString(token)}
                className="flex justify-between items-center p-2 mb-1 text-xs rounded-md"
              >
                {token.toUpperCase()}{' '}
                {selectedToken === token ? (
                  <img
                    alt="checkmark--v1"
                    className="w-4 h-4 stroke-lime"
                    src="https://img.icons8.com/ios-filled/50/ffffff/checkmark--v1.png"
                  />
                ) : (
                  <img
                    alt="logos"
                    className="w-4 h-4"
                    src={`/img/symbols/32/color/${token.toLowerCase()}.png`}
                  />
                )}
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
