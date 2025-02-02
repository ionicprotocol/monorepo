import { useState } from 'react';

import { format, addDays, differenceInDays } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';

import TransactionButton from '@ui/components/TransactionButton';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';

import { LockDurationPicker } from '../../LockDurationPicker';

type ExtendProps = {
  chain: string;
};

export function Extend({ chain }: ExtendProps) {
  const { selectedManagePosition } = useVeIONContext();
  const { address } = useAccount();
  const { handleExtend } = useVeIONManage(Number(chain));

  const currentLockDate = new Date(
    selectedManagePosition?.lockExpires?.date || Date.now()
  );

  // Calculate current duration in days
  const currentDurationDays = selectedManagePosition?.lockedBLP
    ? Math.floor(selectedManagePosition.lockedBLP.duration / 86400)
    : 0;

  const [newLockDate, setNewLockDate] = useState<Date>(() =>
    addDays(currentLockDate, 1)
  );

  const extensionDays = differenceInDays(newLockDate, currentLockDate);
  const [selectedDuration, setSelectedDuration] =
    useState<number>(currentDurationDays);

  const onExtend = async () => {
    if (
      extensionDays <= 0 ||
      !selectedManagePosition?.id ||
      !selectedManagePosition.lockedBLP
    ) {
      return { success: false };
    }

    const newDurationSeconds =
      selectedManagePosition.lockedBLP.duration + extensionDays * 86400;

    const success = await handleExtend({ lockDuration: newDurationSeconds });
    return { success };
  };

  const handleDurationChange = (duration: number) => {
    // Ensure we don't go below current duration
    const newDuration = Math.max(currentDurationDays, duration);
    setSelectedDuration(newDuration);
    const calculatedNewDate = addDays(
      currentLockDate,
      newDuration - currentDurationDays
    );
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
          currentDuration={currentDurationDays}
          minDuration={currentDurationDays}
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

      <TransactionButton
        onSubmit={onExtend}
        isDisabled={!address || extensionDays <= 0}
        buttonText={`Extend Lock by ${extensionDays} Days`}
      />
    </div>
  );
}
