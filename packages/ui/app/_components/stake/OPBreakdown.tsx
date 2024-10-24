import Image from 'next/image';

import { optimism } from 'viem/chains';

import { OPSugarAddress } from '@ui/constants/oplp';
import useSugarAPR from '@ui/hooks/useSugarAPR';

type OPBreakdownProps = {
  step3Toggle: string;
};

const POOL_INDEX = 910n;

export default function OPBreakdown({ step3Toggle }: OPBreakdownProps) {
  const { apr } = useSugarAPR({
    sugarAddress: OPSugarAddress,
    poolIndex: POOL_INDEX,
    chainId: optimism.id
  });

  return (
    <div className="flex items-center w-full mt-3 text-xs gap-2">
      <Image
        alt="VELO logo"
        className="mx-1"
        src="/img/symbols/32/color/velo.png"
        width={24}
        height={24}
      />
      <span>Velodrome APR</span>
      <span
        className={`text-accent ${
          step3Toggle === 'Unstake' && 'text-red-500'
        } ml-auto`}
      >
        {apr}
      </span>
    </div>
  );
}
