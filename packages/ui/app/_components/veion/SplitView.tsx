import { useState } from 'react';

import { InfoIcon } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import { Separator } from '@ui/components/ui/separator';
import { Slider } from '@ui/components/ui/slider';

export function SplitView() {
  const [splitValues, setSplitValues] = useState<[number, number]>([50, 50]);
  const maxAmount = 1000; // Default max amount
  const utilizationMarks = [0, 25, 50, 75, 100];

  // Update both values from either slider
  const handleFirstSliderChange = (newValue: number) => {
    setSplitValues([newValue, 100 - newValue]);
  };

  const handleSecondSliderChange = (newValue: number) => {
    setSplitValues([100 - newValue, newValue]);
  };

  // Calculate actual token amounts based on percentages
  const firstAmount = (splitValues[0] / 100) * maxAmount;
  const secondAmount = (splitValues[1] / 100) * maxAmount;

  return (
    <div className="flex flex-col gap-y-4 py-2 px-3">
      <Separator className="bg-white/10 mb-4" />

      <div className="space-y-6">
        <div>
          <p className="text-xs text-white/50 mb-2">
            First Split: {splitValues[0]}%
          </p>
          <div className="w-full mb-2 text-xs flex justify-between text-white/25">
            {utilizationMarks.map((mark) => (
              <span
                key={mark}
                className={splitValues[0] >= mark ? 'text-accent' : ''}
              >
                {mark}%
              </span>
            ))}
          </div>
          <Slider
            value={[splitValues[0]]}
            onValueChange={(val) => handleFirstSliderChange(val[0])}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-0"
          />
          <p className="text-xs text-white/50 mt-2">
            Amount: {firstAmount.toLocaleString()} veION
          </p>
        </div>

        <Separator className="bg-white/10" />

        <div>
          <p className="text-xs text-white/50 mb-2">
            Second Split: {splitValues[1]}%
          </p>
          <div className="w-full mb-2 text-xs flex justify-between text-white/25">
            {utilizationMarks.map((mark) => (
              <span
                key={mark}
                className={splitValues[1] >= mark ? 'text-accent' : ''}
              >
                {mark}%
              </span>
            ))}
          </div>
          <Slider
            value={[splitValues[1]]}
            onValueChange={(val) => handleSecondSliderChange(val[0])}
            max={100}
            step={1}
            className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-0"
          />
          <p className="text-xs text-white/50 mt-2">
            Amount: {secondAmount.toLocaleString()} veION
          </p>
        </div>
      </div>

      <div className="border border-red-500 text-red-500 text-xs flex items-center gap-3 rounded-md py-2.5 px-4 mt-2">
        <InfoIcon className="h-5 w-5 flex-shrink-0" />
        <span>
          Splitting will cause a loss of unclaimed and pending rewards. Make
          sure to claim everything before you split!
        </span>
      </div>

      <Button className="w-full bg-accent text-black mt-4">Split veION</Button>
    </div>
  );
}
