'use client';

import Link from 'next/link';

import { base, mode } from 'viem/chains';

import { EmissionsStatusTile } from './EmissionsStatusTile';
import RewardDisplay from '../stake/RewardDisplay';

interface Iprop {
  chain: number;
}

export default function StakingTile({ chain }: Iprop) {
  return (
    <div
      className={`w-full h-full lg:col-span-3 md:col-span-2 col-span-3 px-2 lg:px-[2%] xl:px-[3%] flex flex-col items-center justify-center md:justify-start gap-3 bg-grayone py-4 rounded-md`}
    >
      <h1 className={`mr-auto text-xl font-semibold`}>ION Emissions</h1>

      <div className={`w-full flex flex-col items-center justify-start gap-3`}>
        {+chain === mode.id || +chain === base.id ? (
          <RewardDisplay
            chainId={+chain}
            selectedToken={+chain === mode.id ? 'mode' : undefined}
          />
        ) : (
          <span className="text-sm text-center text-white/50 mx-auto">
            Stake your IONs on Base/Mode
          </span>
        )}

        <EmissionsStatusTile />
      </div>

      <div className="h-[2px] w-[95%] mx-auto bg-white/10 mt-auto" />
      <Link
        href={`/veion/governance?chain=${+chain === mode.id || +chain === base.id ? chain : '34443'}`}
        className={`rounded-md bg-accent text-black py-1.5 px-1 uppercase truncate text-xs w-[80%] mx-auto text-center mt-2`}
      >
        Governance
      </Link>
    </div>
  );
}
