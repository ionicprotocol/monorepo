import { useState } from 'react';

import { InfoIcon } from 'lucide-react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

import TransactionButton from '@ui/components/TransactionButton';
import { Separator } from '@ui/components/ui/separator';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';

import InfoVoted from './InfoVoted';
import { PrecisionSlider } from '../../PrecisionSlider';

export function Split() {
  const { selectedManagePosition } = useVeIONContext();
  const chain = Number(selectedManagePosition?.chainId);
  const utilizationMarks = [0, 25, 50, 75, 100];
  const [splitValues, setSplitValues] = useState<[number, number]>([50, 50]);
  const { address } = useAccount();
  const { handleSplit } = useVeIONManage(Number(chain));

  const hasVoted = !!selectedManagePosition?.votingStatus.hasVoted;
  const rawAmount = selectedManagePosition?.lockedBLP?.rawAmount || '0';
  const totalAmount = BigInt(rawAmount);

  const handleFirstSliderChange = (newValue: number) => {
    setSplitValues([newValue, Math.round(100 - newValue)]);
  };

  const handleSecondSliderChange = (newValue: number) => {
    setSplitValues([Math.round(100 - newValue), newValue]);
  };

  const firstAmountRaw = (totalAmount * BigInt(splitValues[0])) / BigInt(100);
  const secondAmountRaw = (totalAmount * BigInt(splitValues[1])) / BigInt(100);

  const firstAmountFormatted = Number(formatEther(firstAmountRaw)).toFixed(4);
  const secondAmountFormatted = Number(formatEther(secondAmountRaw)).toFixed(4);

  const onSplit = async () => {
    if (!selectedManagePosition?.id || !firstAmountRaw) {
      return { success: false };
    }

    const success = await handleSplit({
      from: +selectedManagePosition.id,
      amount: firstAmountRaw
    });

    return { success };
  };

  return (
    <div className="flex flex-col gap-y-4 py-2 px-3">
      {hasVoted && <InfoVoted />}
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
            markSymbol="%"
          />
          <p className="text-xs text-white/50 mt-2">
            Amount: {firstAmountFormatted} BLP
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
            markSymbol="%"
          />
          <p className="text-xs text-white/50 mt-2">
            Amount: {secondAmountFormatted} BLP
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
      <TransactionButton
        onSubmit={onSplit}
        isDisabled={!address || hasVoted}
        buttonText="Split veION"
        targetChainId={chain}
      />
    </div>
  );
}
