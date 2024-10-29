import { useState } from 'react';

import { format } from 'date-fns';

import { Button } from '@ui/components/ui/button';
import { Separator } from '@ui/components/ui/separator';

import AutoLock from './AutoLock';
import CustomTooltip from '../CustomTooltip';
import { LockDurationPicker } from '../LockDurationPicker';

export function ExtendView() {
  const [autoLock, setAutoLock] = useState(false);
  const [lockDate, setLockDate] = useState<Date>(() => new Date());
  const [selectedDuration, setSelectedDuration] = useState<number>(180);

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
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

      <Separator className="bg-white/10 my-4" />

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          VOTING POWER
          <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
        </div>
        <p>0.00 veIon</p>
      </div>

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        LOCKED Until
        <p>28 Aug 2023 → {format(lockDate, 'dd MMM yyyy')}</p>
      </div>

      <Button className="w-full bg-accent text-black mt-4">Extend Lock</Button>
    </div>
  );
}
