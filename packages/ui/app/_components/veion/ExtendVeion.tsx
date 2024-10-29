import { format } from 'date-fns';
import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';

import { PrecisionSlider, usePrecisionSlider } from '../PrecisionSlider';
import { LockDurationPicker } from '../LockDurationPicker';
import AutoLock from './AutoLock';
import CustomTooltip from '../CustomTooltip';
import { useState } from 'react';

interface ExtendVeionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentVotingPower?: string;
  currentLockDate?: string;
  maxToken?: number;
}

const ExtendVeion = ({
  isOpen,
  onOpenChange,
  currentVotingPower = '20.00',
  currentLockDate = '28 Aug 2023',
  maxToken = 100
}: ExtendVeionProps) => {
  const [autoLock, setAutoLock] = useState(false);
  const [lockDate, setLockDate] = useState<Date>(() => new Date());
  const [selectedDuration, setSelectedDuration] = useState<number>(180);

  const {
    amount: veIonAmount,
    percentage: utilization,
    handlePercentageChange: handleUtilizationChange
  } = usePrecisionSlider({
    maxValue: maxToken,
    initialValue: 0
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
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

        <div className="space-y-4">
          {/* Amount Slider */}
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

          <AutoLock
            autoLock={autoLock}
            setAutoLock={setAutoLock}
          />

          <Separator className="bg-white/10" />

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

          <Button className="w-full bg-accent text-black">Extend Lock</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtendVeion;
