/* eslint-disable @next/next/no-img-element */
'use client';

import { useSearchParams } from 'next/navigation';
import { useChainId } from 'wagmi';

import InfoPopover from '../../_components/veion/InfoPopover';

import NetworkSelector from 'ui/app/_components/markets/NetworkSelector';

export default function Governance() {
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const querywatch = searchParams.get('watch');
  const querychain = searchParams.get('chain');
  const chain = querychain ?? chainId;
  const watch = querywatch ?? 'overview';
  return (
    <div className="w-full flex flex-col items-start py-4 justify-start h-min bg-darkone ">
      <div className="flex flex-col items-start justify-start w-full h-min rounded-md bg-grayone px-6 py-4">
        <div className={`flex items-center justify-between w-full`}>
          <span className={`w-full font-semibold text-lg`}>
            {watch === 'overview' ? 'veION Overview' : 'My VeION'}
          </span>
          <div className={`flex self-end`}>
            <NetworkSelector
              nopool={true}
              dropdownSelectedChain={+chain}
            />
          </div>
        </div>
        <div className="flex  gap-x-3">
          <div className="flex flex-col gap-1 mt-3">
            <div className="text-white/60 text-xs">
              Ion Wallet Balance{' '}
              <InfoPopover content="This is the amount of ION you have in your wallet." />
            </div>
            <div className="text-white/60 text-xs flex items-center">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block`}
                src="/img/symbols/32/color/ion.png"
              />
              <span className="text-white text-sm ">
                {watch === 'overview' ? '78942387' : '6376'} ION
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <div className="text-white/60 text-xs">
              Total veION{' '}
              <InfoPopover content="This is the amount of veION you have in your wallet." />
            </div>
            <div className="text-white/60 text-xs flex items-center">
              <img
                alt="ion logo"
                className={`w-6 h-6 inline-block`}
                src="/img/symbols/32/color/ion.png"
              />
              <span className="text-white text-sm ">
                {watch === 'overview' ? '5674' : '63754'} veION
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
