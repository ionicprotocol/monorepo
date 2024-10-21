/* eslint-disable @next/next/no-img-element */
'use client';

import type { VotingData } from '@ui/constants/mock';

export default function VotingRows({
  id,
  network,
  supplyAsset,
  totalVotes,
  myVotes
}: VotingData) {
  return (
    <>
      <div
        className={`w-full h-full md:grid grid-cols-7 hover:bg-graylite transition-all duration-200 ease-linear bg-grayUnselect rounded-xl mb-3 px-2  gap-x-1 relative *:text-center py-4 *:text-sm *:content-center `}
      >
        <h3
          className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            ID
          </span>
          <span className={`md:text-center text-right`}> {id}</span>
        </h3>
        <h3
          className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            NETWORK
          </span>
          <span
            className={`md:text-center text-right gap-2 flex items-center justify-center`}
          >
            <img
              alt="network"
              className={` h-5 inline-block cursor-pointer `}
              src={`/img/symbols/32/color/${network.toLowerCase()}.png`}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = '/img/assets/warn.png';
              }}
            />
            {network}
          </span>
        </h3>
        <h3
          className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            SUPPLY ASSET
          </span>
          <span
            className={`md:text-center text-right gap-2 flex items-center justify-center`}
          >
            <img
              alt="asset"
              className={` h-5 cursor-pointer inline-block `}
              src={`/img/symbols/32/color/${supplyAsset.toLowerCase()}.png`}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = '/img/assets/warn.png';
              }}
            />
            {supplyAsset}
          </span>
        </h3>
        <h3
          className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            TOTAL VOTES
          </span>
          <span className={`md:text-center text-right`}>
            {' '}
            {totalVotes.percentage}
          </span>
        </h3>
        <h3
          className={` col-span-1 flex md:block justify-between md:justify-center px-2 md:px-0 items-center mb-2 md:mb-0`}
        >
          <span className="text-white/40 font-semibold mr-2 text-[11px] md:hidden text-left">
            MY VOTES
          </span>
          <span className={`md:text-center text-right`}>
            {' '}
            {myVotes.percentage}
          </span>
        </h3>
        <h3 className="col-span-2 w-full ">
          <div
            className={`border flex items-center justify-between border-white/30 rounded-md py-2 px-4 w-[80%] md:w-[60%] mx-auto`}
          >
            <input
              className={`focus:outline-none amount-field font-bold bg-transparent disabled:text-white/60 flex-auto flex  trucnate   `}
              placeholder={`Enter % Vote`}
              type="string"
              // onChange={(e) => setTransferAddress(e.target.value)}
              // disabled={handleInput ? false : true}
            />
            <button> Max </button>
          </div>
        </h3>
      </div>
    </>
  );
}
