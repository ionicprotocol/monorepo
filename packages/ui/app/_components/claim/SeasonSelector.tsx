/* eslint-disable @next/next/no-img-element */
'use client';
/* eslint-disable  @typescript-eslint/no-explicit-any */

import React from 'react';

interface INetworkSelector {
  // chainId?: string;
  dropdownSelectedSeason: number;
  newRef: any;
  open: boolean;
  setDropdownSelectedSeason: any;
  setOpen: any;
}

export default function SeasonSelector({
  dropdownSelectedSeason,
  setDropdownSelectedSeason,
  setOpen,
  open,
  newRef
}: INetworkSelector) {
  const seasonOptions = [
    {
      id: 0,
      name: 'S1 Pre-Sale'
    },
    {
      id: 1,
      name: 'Airdrop SZN 1'
    }
  ];
  return (
    <div
      className="w-full capitalize text-md  relative "
      ref={newRef}
    >
      <div
        className={` cursor-pointer my-2  w-full   flex  flex-col items-start justify-start order border-b-none border-stone-700  `}
        onClick={() => setOpen((prevState: any) => !prevState)}
      >
        <div
          className={`py-2 px-2 w-full relative items-center border-2 border-stone-700 bg-graylite text-sm  ${
            open ? 'rounded-t-md' : 'rounded-xl '
          }`}
        >
          {seasonOptions[dropdownSelectedSeason].name}
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
          } top-full w-full  origin-top z-40 shadow-xl shadow-black/10 rounded-b-md py-2 border border-stone-700 absolute bg-grayone/50 backdrop-blur-sm p-2 `}
        >
          {seasonOptions.map((season: any, idx: number) => (
            <div
              className={`flex justify-between items-center p-2 mb-1 rounded-md `}
              key={idx}
              onClick={() => setDropdownSelectedSeason(season.id)}
            >
              {season.name}{' '}
              {dropdownSelectedSeason == season.id && (
                <img
                  alt="checkmark--v1"
                  className={`w-4 h-4 stroke-lime`}
                  src="https://img.icons8.com/ios-filled/50/ffffff/checkmark--v1.png"
                />
              )}
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
