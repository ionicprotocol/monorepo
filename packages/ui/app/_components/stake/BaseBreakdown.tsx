import Image from 'next/image';

import { base } from 'viem/chains';

import { BaseSugarAddress } from '@ui/constants/baselp';
import useSugarAPR from '@ui/hooks/useSugarAPR';

type BaseBreakdownProps = {
  step3Toggle: string;
};

const ION_POOL_INDEX = 1489n;

export default function BaseBreakdown({ step3Toggle }: BaseBreakdownProps) {
  const { apr } = useSugarAPR({
    sugarAddress: BaseSugarAddress,
    poolIndex: ION_POOL_INDEX,
    chainId: base.id
  });

  return (
    <div className="flex items-center w-full mt-3 text-xs gap-2">
      <Image
        alt="AERO logo"
        className="mx-1"
        src="/img/logo/AERO.png"
        width={24}
        height={24}
      />
      <span>Aerodrome APR</span>
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
