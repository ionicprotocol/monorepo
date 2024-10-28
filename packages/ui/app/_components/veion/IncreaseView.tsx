import { useState, useEffect } from 'react';

import { Button } from '@ui/components/ui/button';
import { Separator } from '@ui/components/ui/separator';
import { Slider } from '@ui/components/ui/slider';
import { getToken } from '@ui/utils/getStakingTokens';

import CustomTooltip from '../CustomTooltip';
import MaxDeposit from '../stake/MaxDeposit';

type IncreaseViewProps = {
  chain: string;
};

export function IncreaseView({ chain }: IncreaseViewProps) {
  const utilizationMarks = [0, 25, 50, 75, 100];
  const [veionAmount, setVeIonAmount] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const maxtoken = '1000';

  useEffect(() => {
    const newSliderValue = (veionAmount / Number(maxtoken)) * 100;
    setSliderValue(newSliderValue);
  }, [veionAmount, maxtoken]);

  const handleInputChange = (val?: string) => {
    if (val !== undefined) {
      setVeIonAmount(Number(val));
    }
  };

  const handleSliderChange = (val: number[]) => {
    const newVal = val[0];
    setSliderValue(newVal);
    const veionval = (newVal / 100) * Number(maxtoken);
    setVeIonAmount(veionval);
  };

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <MaxDeposit
        headerText={'Lock Amount'}
        max={maxtoken}
        amount={String(veionAmount)}
        tokenName={'ion/eth LP'}
        token={getToken(+chain)}
        handleInput={handleInputChange}
        chain={+chain}
      />
      <div className="w-full mx-auto mt-3 mb-5">
        <div className="w-full mb-2 text-xs flex justify-between text-white/25">
          {utilizationMarks.map((mark) => (
            <span
              key={mark}
              className={sliderValue >= mark ? 'text-accent' : ''}
            >
              {mark}%
            </span>
          ))}
        </div>
        <Slider
          value={[sliderValue]}
          onValueChange={handleSliderChange}
          max={100}
          step={1}
          className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-0"
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
