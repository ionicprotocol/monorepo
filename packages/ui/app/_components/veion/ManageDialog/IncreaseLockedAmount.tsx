import { Button } from '@ui/components/ui/button';
import { Separator } from '@ui/components/ui/separator';
import { getToken } from '@ui/utils/getStakingTokens';

import CustomTooltip from '../../CustomTooltip';
import { usePrecisionSlider, PrecisionSlider } from '../../PrecisionSlider';
import MaxDeposit from '../../stake/MaxDeposit';

type IncreaseLockedAmountProps = {
  chain: string;
};

export function IncreaseLockedAmount({ chain }: IncreaseLockedAmountProps) {
  const utilizationMarks = [0, 25, 50, 75, 100];
  const maxtoken = 1000;

  const {
    amount: veionAmount,
    percentage: sliderValue,
    handleAmountChange: handleInputChange,
    handlePercentageChange: handleSliderChange
  } = usePrecisionSlider({ maxValue: maxtoken });

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <MaxDeposit
        headerText={'Lock Amount'}
        max={String(maxtoken)}
        amount={String(veionAmount)}
        tokenName={'ion/eth LP'}
        token={getToken(+chain)}
        handleInput={(val?: string) => handleInputChange(Number(val || 0))}
        chain={+chain}
      />
      <div className="w-full mx-auto mt-3 mb-5">
        <PrecisionSlider
          value={sliderValue}
          onChange={handleSliderChange}
          marks={utilizationMarks}
        />
      </div>
      <Separator className="bg-white/10 my-4" />

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          VOTING POWER
          <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
        </div>
        <p>0.00 veIon</p>
      </div>
      <div className="flex w-full items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          LP <CustomTooltip content="Info regarding the locked BLP." />
        </div>
        <p>67.90 veIon</p>
      </div>
      <Button className="w-full bg-accent text-black mt-4">
        Increase Locked Amount
      </Button>
    </div>
  );
}
