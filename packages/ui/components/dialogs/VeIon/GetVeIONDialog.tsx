import { useEffect, useState } from 'react';

import Image from 'next/image';

import { useAccount } from 'wagmi';

import CustomTooltip from '@ui/components/CustomTooltip';
import { LockDurationPicker } from '@ui/components/LockDurationPicker';
import MaxDeposit from '@ui/components/MaxDeposit';
import { usePrecisionSlider } from '@ui/components/PrecisionSlider';
import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import AutoLock from '@ui/components/veion/AutoLock';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONActions } from '@ui/hooks/veion/useVeIONActions';
import { getToken, getAvailableStakingToken } from '@ui/utils/getStakingTokens';

interface GetVeIONDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedToken: 'eth' | 'mode' | 'weth';
}

export default function GetVeIONDialog({
  isOpen,
  onOpenChange,
  selectedToken
}: GetVeIONDialogProps) {
  const [lockDate, setLockDate] = useState<Date>(() => new Date());
  const [autoLock, setAutoLock] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('0');
  const { isConnected } = useAccount();
  const { currentChain, veIonBalance } = useVeIONContext();
  const { createLock, isPending } = useVeIONActions();

  const { amount: selectedDuration, handleAmountChange: handleDurationChange } =
    usePrecisionSlider({
      maxValue: 730,
      initialValue: 180
    });

  useEffect(() => {
    setAmount('0');
  }, [currentChain]);

  async function lockAndGetVeion() {
    try {
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }

      const tokenAddress = getAvailableStakingToken(
        currentChain,
        selectedToken
      );
      await createLock({
        tokenAddress: tokenAddress as `0x${string}`,
        tokenAmount: amount,
        duration: selectedDuration,
        stakeUnderlying: true
      });
      setSuccess(true);
    } catch (err) {
      console.warn(err);
    }
  }

  const isButtonDisabled = !lockDate || Number(amount) === 0 || isPending;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayUnselect w-full max-w-[480px]">
        {!success ? (
          <>
            <DialogHeader>
              <DialogTitle>Get veION</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <MaxDeposit
                headerText="LOCK AMOUNT"
                max={veIonBalance}
                amount={amount}
                tokenName="ion/weth"
                token={getToken(currentChain)}
                handleInput={(val?: string) => setAmount(val || '0')}
                chain={currentChain}
                showUtilizationSlider
              />

              <Separator className="bg-white/10" />

              <LockDurationPicker
                selectedDuration={selectedDuration}
                lockDate={lockDate}
                onDurationChange={handleDurationChange}
                onDateChange={setLockDate}
              />

              <AutoLock
                autoLock={autoLock}
                setAutoLock={setAutoLock}
              />

              <Separator className="bg-white/10" />

              <VotingPowerInfo amount={Number(amount)} />

              <Button
                onClick={lockAndGetVeion}
                className="w-full bg-accent text-black"
                disabled={isButtonDisabled}
              >
                {isPending ? 'Locking...' : 'Lock LP and get veION'}
              </Button>
            </div>
          </>
        ) : (
          <SuccessView
            amount={Number(amount)}
            onClose={() => setSuccess(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function VotingPowerInfo({ amount }: { amount: number }) {
  return (
    <div className="flex w-full items-center justify-between text-xs text-white/50">
      <div className="flex items-center gap-2">
        VOTING POWER
        <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
      </div>
      <p className="text-white">{amount.toFixed(2)} veIon</p>
    </div>
  );
}

function SuccessView({
  amount,
  onClose
}: {
  amount: number;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-y-4 py-2">
      <DialogHeader>
        <DialogTitle>Congratulations!</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-white/60">
        Successfully locked {amount.toFixed(2)} LP tokens for{' '}
        {amount.toFixed(2)} veION.
        <br /> <br />
        Proceed to your veION Overview to vote on your favorite Market.
      </p>
      <Image
        src="/api/placeholder/48/48"
        alt="success"
        width={48}
        height={48}
        className="w-12 mx-auto h-12"
      />
      <Button
        onClick={onClose}
        className="w-full bg-accent text-black"
      >
        Back to Overview
      </Button>
    </div>
  );
}
