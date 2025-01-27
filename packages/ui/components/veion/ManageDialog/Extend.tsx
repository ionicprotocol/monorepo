import { useState } from 'react';

import { format, addDays, differenceInDays } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';

import { LockDurationPicker } from '../../LockDurationPicker';
import AutoLock from '../AutoLock';

type ExtendProps = {
  chain: string;
};

export function Extend({ chain }: ExtendProps) {
  const { selectedManagePosition } = useVeIONContext();
  const { address } = useAccount();
  const { extendLock, isPending } = useVeIONManage(Number(chain));

  const currentLockDate = new Date(
    selectedManagePosition?.lockExpires?.date || Date.now()
  );
  const [newLockDate, setNewLockDate] = useState<Date>(() =>
    addDays(currentLockDate, 1)
  );

  const extensionDays = differenceInDays(newLockDate, currentLockDate);
  const [autoLock, setAutoLock] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);

  const handleExtend = async () => {
    if (
      extensionDays <= 0 ||
      !selectedManagePosition?.id ||
      !selectedManagePosition.lockedBLP
    )
      return;

    // Add the extension days in seconds
    const newDurationSeconds =
      selectedManagePosition.lockedBLP.duration + extensionDays * 86400;

    await extendLock({
      tokenId: +selectedManagePosition.id,
      lockDuration: newDurationSeconds
    });
  };

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
    const calculatedNewDate = addDays(currentLockDate, duration);
    setNewLockDate(calculatedNewDate);
  };

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <div className="flex flex-col gap-y-2">
        <LockDurationPicker
          selectedDuration={selectedDuration}
          lockDate={newLockDate}
          onDurationChange={handleDurationChange}
          onDateChange={(date) => setNewLockDate(date)}
          baseLockDate={currentLockDate}
          minDuration={1}
          maxDuration={730}
          tooltipContent="Longer lock periods provide higher voting power"
        />
      </div>

      <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
        <div className="flex flex-col">
          <span className="text-sm text-white/60">NEW LOCK ENDS</span>
          <span className="text-lg font-medium">
            {format(newLockDate, 'dd MMM yyyy')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">+{extensionDays} days</span>
          <ArrowRight className="w-4 h-4 text-accent" />
        </div>
      </div>

      <AutoLock
        autoLock={autoLock}
        setAutoLock={setAutoLock}
      />

      <Button
        className="w-full bg-accent text-black mt-2"
        onClick={handleExtend}
        disabled={isPending || !address || extensionDays <= 0}
      >
        {isPending ? 'Extending...' : `Extend Lock by ${extensionDays} Days`}
      </Button>
    </div>
  );
}
