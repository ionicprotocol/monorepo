import { mode } from 'viem/chains';

import { ModeSugarAddress } from '@ui/constants/lp';
import useSugarAPR from '@ui/hooks/useSugarAPR';

type ModeBreakdownProps = {
  step3Toggle: string;
  selectedtoken: 'eth' | 'mode' | 'weth';
};
export default function ModeBreakdown({
  step3Toggle,
  selectedtoken
}: ModeBreakdownProps) {
  return (
    <>
      <div className="flex items-center w-full mt-3 text-xs gap-2">
        <img
          alt="ion logo"
          className={`w-6 h-6 inline-block mx-1 bg-blend-screen`}
          src="/img/symbols/32/color/velo.png"
        />
        <VelodromeAPR
          step3Toggle={step3Toggle}
          selectedToken={selectedtoken}
        />
      </div>
      <div className="flex items-center w-full mt-3 text-xs gap-2">
        <img
          alt="ion logo"
          className={`w-6 h-6 inline-block mx-1`}
          src="/img/logo/MODE.png"
        />
        <span>Mode Points</span>
        <span
          className={`text-accent ml-auto ${
            step3Toggle === 'Unstake' && 'text-red-500'
          }`}
        >
          {selectedtoken === 'mode' ? '5x' : '3x'}
        </span>
      </div>
    </>
  );
}

export type VelodromeAPRProps = {
  step3Toggle: string;
  selectedToken: 'eth' | 'mode' | 'weth';
};

const VelodromeAPR = ({ step3Toggle, selectedToken }: VelodromeAPRProps) => {
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
    <>
      <span>Velodrome APR</span>
      <span
        className={`text-accent ${
          step3Toggle === 'Unstake' && 'text-red-500'
        } ml-auto`}
      >
        {apy}
      </span>
    </>
  );
};
