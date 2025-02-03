// Extend.tsx
import { useState } from 'react';

import { format, addDays, differenceInDays } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';

import TransactionButton from '@ui/components/TransactionButton';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';

import { LockDurationPicker } from '../../LockDurationPicker';

const MIN_LOCK_DURATION = 180;
const MAX_LOCK_DURATION = 730;

export function Extend() {
  const { selectedManagePosition } = useVeIONContext();
  const chain = Number(selectedManagePosition?.chainId);
  const { address } = useAccount();
  const { handleExtend } = useVeIONManage(
    Number(selectedManagePosition?.chainId)
  );

  const currentLockDate = new Date(
    selectedManagePosition?.lockExpires?.date || Date.now()
  );

  const currentDurationDays = selectedManagePosition?.lockedBLP
    ? Math.floor(selectedManagePosition.lockedBLP.duration / 86400)
    : 0;

  // Calculate minimum days needed to reach MIN_LOCK_DURATION
  const minNeededDays = Math.max(0, MIN_LOCK_DURATION - currentDurationDays);

  // Initialize with current duration + minimum needed days (if any)
  const [selectedDuration, setSelectedDuration] = useState<number>(() =>
    Math.min(currentDurationDays + minNeededDays, MAX_LOCK_DURATION)
  );

  const [newLockDate, setNewLockDate] = useState<Date>(() =>
    addDays(currentLockDate, minNeededDays)
  );

  const extensionDays = differenceInDays(newLockDate, currentLockDate);
  const totalDurationAfterExtension = currentDurationDays + extensionDays;

  const isExtensionValid =
    totalDurationAfterExtension >= MIN_LOCK_DURATION &&
    totalDurationAfterExtension <= MAX_LOCK_DURATION;

  const onExtend = async () => {
    if (
      !isExtensionValid ||
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
    // Ensure total duration is at least MIN_LOCK_DURATION and at most MAX_LOCK_DURATION
    const maxAllowedExtension = MAX_LOCK_DURATION - currentDurationDays;

    // Calculate new duration within bounds
    const newDuration = Math.min(
      duration,
      currentDurationDays + maxAllowedExtension
    );

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
          maxDuration={MAX_LOCK_DURATION}
          tooltipContent="Longer lock periods provide higher voting power"
          isExtending={true}
        />
      </div>

      <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
        <div className="flex flex-col">
          <span className="text-sm text-white/60">NEW LOCK ENDS</span>
          <span className="text-lg font-medium">
            {format(newLockDate, 'dd MMM yyyy')}
          </span>
          <span className="text-xs text-white/40">
            Total duration: {totalDurationAfterExtension} days
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">+{extensionDays} days</span>
          <ArrowRight className="w-4 h-4 text-accent" />
        </div>
      </div>

      <TransactionButton
        onSubmit={onExtend}
        isDisabled={!address || !isExtensionValid}
        buttonText={
          totalDurationAfterExtension > MAX_LOCK_DURATION
            ? 'Cannot exceed maximum duration'
            : totalDurationAfterExtension < MIN_LOCK_DURATION
              ? `Need ${minNeededDays} more days minimum`
              : `Extend Lock by ${extensionDays} Days`
        }
        targetChainId={chain}
      />
    </div>
  );
}
