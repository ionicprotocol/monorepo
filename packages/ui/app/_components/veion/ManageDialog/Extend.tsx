import { useState } from 'react';

import { format } from 'date-fns';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Separator } from '@ui/components/ui/separator';
import { useToast } from '@ui/hooks/use-toast';
import { useVeIONManage } from '@ui/hooks/veion/useVeIONManage';
import { getAvailableStakingToken } from '@ui/utils/getStakingTokens';

import CustomTooltip from '../../CustomTooltip';
import { LockDurationPicker } from '../../LockDurationPicker';
import AutoLock from '../AutoLock';

type ExtendProps = {
  chain: string;
  currentLockDate?: Date;
  votingPower?: string;
};

export function Extend({
  chain,
  currentLockDate,
  votingPower = '0.00'
}: ExtendProps) {
  const [autoLock, setAutoLock] = useState(false);
  const [lockDate, setLockDate] = useState<Date>(
    () => currentLockDate || new Date()
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(180);

  const { address } = useAccount();
  const { toast } = useToast();
  const { extendLock, isPending } = useVeIONManage(Number(chain));

  const tokenAddress = getAvailableStakingToken(+chain, 'eth');

  const handleExtend = () => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive'
      });
      return;
    }

    extendLock({
      tokenAddress: tokenAddress as `0x${string}`,
      tokenId: tokenAddress,
      lockDuration: selectedDuration * 86400 // Convert days to seconds
    });
  };

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
        <p>{votingPower} veIon</p>
      </div>

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        LOCKED Until
        <p>
          {currentLockDate
            ? format(currentLockDate, 'dd MMM yyyy')
            : 'Not locked'}
          → {format(lockDate, 'dd MMM yyyy')}
        </p>
      </div>

      <Button
        className="w-full bg-accent text-black mt-4"
        onClick={handleExtend}
        disabled={isPending || !address}
      >
        {isPending ? 'Extending...' : 'Extend Lock'}
      </Button>
    </div>
  );
}
