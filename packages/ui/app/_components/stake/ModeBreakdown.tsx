import Image from 'next/image';

import { mode } from 'viem/chains';

import { ModeSugarAddress } from '@ui/constants/lp';
import useSugarAPR from '@ui/hooks/useSugarAPR';

type ModeBreakdownProps = {
  step3Toggle: string;
  selectedToken: 'eth' | 'mode' | 'weth';
};

export default function ModeBreakdown({
  step3Toggle,
  selectedToken
}: ModeBreakdownProps) {
  const ION_WETH_POOL_INDEX = 6n;
  const ION_MODE_POOL_INDEX = 26n;

  const { apr: apy } = useSugarAPR({
    sugarAddress: ModeSugarAddress,
    poolIndex:
      selectedToken === 'mode' ? ION_MODE_POOL_INDEX : ION_WETH_POOL_INDEX,
    chainId: mode.id,
    selectedToken,
    isMode: true
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
        {apy}
      </span>
    </div>
  );
}
