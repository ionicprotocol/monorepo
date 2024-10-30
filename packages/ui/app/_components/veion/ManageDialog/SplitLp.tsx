import { useState } from 'react';

import { InfoIcon } from 'lucide-react';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Separator } from '@ui/components/ui/separator';
import { useManageMyVeION } from '@ui/hooks/veion/useManageMyVeION';
import { getAvailableStakingToken } from '@ui/utils/getStakingTokens';

import { PrecisionSlider } from '../../PrecisionSlider';

type SplitLpProps = {
  chain: string;
  tokenId?: string;
  maxAmount?: number;
};

export function SplitLp({ chain, tokenId, maxAmount = 1000 }: SplitLpProps) {
  const utilizationMarks = [0, 25, 50, 75, 100];
  const [splitValues, setSplitValues] = useState<[number, number]>([50, 50]);

  const { address } = useAccount();
  const { split, isPending } = useManageMyVeION(Number(chain));
  const lpToken = getAvailableStakingToken(+chain, 'eth');

  const handleFirstSliderChange = (newValue: number) => {
    setSplitValues([newValue, Math.round(100 - newValue)]);
  };

  const handleSecondSliderChange = (newValue: number) => {
    setSplitValues([Math.round(100 - newValue), newValue]);
  };

  const firstAmount = Number(((splitValues[0] / 100) * maxAmount).toFixed(2));
  const secondAmount = Number(((splitValues[1] / 100) * maxAmount).toFixed(2));

  const handleSplit = async () => {
    if (!address || !tokenId || !firstAmount) return;

    await split({
      tokenAddress: lpToken as `0x${string}`,
      from: tokenId as `0x${string}`,
      amount: firstAmount
    });
  };

  return (
    <div className="flex flex-col gap-y-4 py-2 px-3">
      <Separator className="bg-white/10 mb-4" />

      <div className="space-y-6">
        <div>
          <p className="text-xs text-white/50 mb-2">
            First Split: {splitValues[0]}%
          </p>
          <PrecisionSlider
            value={splitValues[0]}
            onChange={handleFirstSliderChange}
            marks={utilizationMarks}
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
          <PrecisionSlider
            value={splitValues[1]}
            onChange={handleSecondSliderChange}
            marks={utilizationMarks}
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

      <Button
        className="w-full bg-accent text-black mt-4"
        disabled={isPending || !address}
        onClick={handleSplit}
      >
        {isPending ? 'Splitting...' : 'Split veION'}
      </Button>
    </div>
  );
}
