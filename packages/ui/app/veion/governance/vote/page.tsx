/* eslint-disable @next/next/no-img-element */
'use client';

import { votingData } from '@ui/constants/mock';
import FlatMap from 'ui/app/_components/points_comp/FlatMap';
import InfoPopover from 'ui/app/_components/veion/InfoPopover';
import VotingRows from 'ui/app/_components/veion/VotingRows';

export default function Vote() {
  return (
    <div className="w-full flex flex-col items-start py-4 gap-y-2 justify-start h-min bg-darkone ">
      <div className="flex flex-col items-start justify-start w-full h-min rounded-md bg-grayone px-6 py-4 ">
        <div className={`flex flex-col w-full`}>
          <span className={`w-full font-semibold text-lg`}>Vote</span>
          <div className={`flex items-c gap-4`}>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-white/60 text-xs">
                Locked Value{' '}
                <InfoPopover content="This is the amount of ION you have in your wallet." />
              </div>
              <div className="text-white/60 text-xs flex items-center">
                {/* <img
                  alt="ion logo"
                  className={`w-6 h-6 inline-block`}
                  src="/img/symbols/32/color/ion.png"
                /> */}
                <span className="text-white text-sm ">$7894</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-white/60 text-xs">
                Locked Until{' '}
                <InfoPopover content="This is the amount of veION you have in your wallet." />
              </div>
              <div className="text-white/60 text-xs flex items-center">
                {/* <img
                  alt="ion logo"
                  className={`w-6 h-6 inline-block`}
                  src="/img/symbols/32/color/ion.png"
                /> */}
                <span className="text-white text-sm ">11Jan26</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-3">
              <div className="text-white/60 text-xs">
                My Voting Power{' '}
                <InfoPopover content="This is the amount of veION you have in your wallet." />
              </div>
              <div className="text-white/60 text-xs flex items-center">
                <img
                  alt="ion logo"
                  className={`w-6 h-6 inline-block`}
                  src="/img/symbols/32/color/ion.png"
                />
                <span className="text-white text-sm ">5674 veION</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start justify-start w-full h-min rounded-md bg-grayone px-6 py-4 ">
        <div className="flex">
          <span className="text-xl"> Emissions Management</span>
        </div>
        <div className="my-3 w-full">
          <FlatMap />
        </div>
        <div
          className={`w-full gap-x-1 hidden md:grid  grid-cols-7 items-start py-4 text-[10px] text-white/40 font-semibold text-center px-2 `}
        >
          <h3 className={` col-span-1`}>ID</h3>
          <h3 className={` col-span-1`}>NETWORK</h3>
          <h3 className={` col-span-1`}>SUPPLY ASSET</h3>
          <h3 className={` col-span-1`}>TOTAL VOOTES</h3>
          <h3 className={` col-span-1`}>MY VOTES</h3>
        </div>

        {votingData.map((data, idx) => (
          <VotingRows
            key={idx}
            {...data}
          />
        ))}
      </div>
    </div>
  );
}
