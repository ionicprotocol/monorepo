'use client';

import { useState } from 'react';

import { format } from 'date-fns';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useToast } from '@ui/hooks/use-toast';
import { useVeIONExtend } from '@ui/hooks/veion/useVeIONExtend';

import CustomTooltip from '../CustomTooltip';
import { LockDurationPicker } from '../LockDurationPicker';
import { PrecisionSlider, usePrecisionSlider } from '../PrecisionSlider';

interface ExtendVeionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentVotingPower?: string;
  currentLockDate?: string;
  maxToken?: number;
  tokenId: number;
  tokenAddress: string;
}

const ExtendVeion = ({
  isOpen,
  onOpenChange,
  currentVotingPower = '20.00',
  currentLockDate = '28 Aug 2023',
  maxToken = 100,
  tokenId,
  tokenAddress
}: ExtendVeionProps) => {
  const { toast } = useToast();
  const [lockDate, setLockDate] = useState<Date>(() => new Date());
  const [selectedDuration, setSelectedDuration] = useState<number>(180);
  const { currentChain } = useVeIONContext();

  const {
    amount: veIonAmount,
    percentage: utilization,
    handlePercentageChange: handleUtilizationChange
  } = usePrecisionSlider({
    maxValue: maxToken,
    initialValue: 0
  });

  const { extendLock, resetState, isExtending, isApproving, error } =
    useVeIONExtend(currentChain);

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  const handleExtend = async () => {
    try {
      const success = await extendLock({
        tokenId,
        lockDuration: selectedDuration * 24 * 60 * 60, // Convert days to seconds
        tokenAddress,
        increaseAmount: veIonAmount.toString()
      });

      if (success) {
        toast({
          title: 'Success',
          description: 'Successfully extended veION lock'
        });

        // Close dialog after success
        setTimeout(() => {
          handleOpenChange(false);
        }, 2000);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="bg-grayone border border-grayUnselect sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Extend veION</DialogTitle>
        </DialogHeader>

        <div className="flex gap-5 text-xs">
          <span className="text-white/50">
            Voting Power: {currentVotingPower} veION
          </span>
          <span className="text-white/50">Locked Until: {currentLockDate}</span>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <p>AMOUNT</p>
              <CustomTooltip content="Select the amount of tokens to lock" />
            </div>
            <PrecisionSlider
              value={utilization}
              onChange={handleUtilizationChange}
              max={100}
              min={0}
              step={1}
            />
            <div className="text-xs text-white/60">
              {Number(veIonAmount).toFixed(2)} / {maxToken} ION
            </div>
          </div>

          <LockDurationPicker
            selectedDuration={selectedDuration}
            lockDate={lockDate}
            onDurationChange={setSelectedDuration}
            onDateChange={setLockDate}
          />

          <Separator className="bg-white/10 my-4" />

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/50">
              <div className="flex items-center gap-2">
                VOTING POWER
                <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
              </div>
              <span>
                {currentVotingPower} → {Number(veIonAmount).toFixed(2)} veION
              </span>
            </div>
            <div className="flex justify-between text-xs text-white/50">
              <span>LOCKED Until</span>
              <span>
                {currentLockDate} → {format(lockDate, 'dd MMM yyyy')}
              </span>
            </div>
          </div>

          <Button
            className="w-full bg-accent text-black"
            onClick={handleExtend}
            disabled={isExtending || isApproving}
          >
            {isApproving
              ? 'Approving...'
              : isExtending
                ? 'Extending Lock...'
                : 'Extend Lock'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtendVeion;
