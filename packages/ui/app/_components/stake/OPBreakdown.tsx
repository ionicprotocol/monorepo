import Image from 'next/image';

import { optimism } from 'viem/chains';

import useSugarAPR from '@ui/hooks/useSugarAPR';

type OPBreakdownProps = {
  step3Toggle: string;
};

const LP_SUGAR_ADDRESS = '0x35F233BE126d7D08aB2D65E647E8c379b1FACF39';
const POOL_INDEX = 910n;

export default function OPBreakdown({ step3Toggle }: OPBreakdownProps) {
  const { apr } = useSugarAPR({
    sugarAddress: LP_SUGAR_ADDRESS,
    poolIndex: POOL_INDEX,
    chainId: optimism.id
  });

  return (
    <div className="flex items-center w-full mt-3 text-xs gap-2">
      <Image
        alt="pool logo"
        className="w-6 h-6 inline-block mx-1 bg-blend-screen"
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
