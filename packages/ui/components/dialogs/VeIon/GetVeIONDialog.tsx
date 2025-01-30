import { useEffect, useState } from 'react';

import { formatUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

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
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useVeIONActions } from '@ui/hooks/veion/useVeIONActions';
import { getAvailableStakingToken } from '@ui/utils/getStakingTokens';

import { SuccessView } from './SuccessView';

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
  const [success, setSuccess] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('0');
  const { currentChain } = useVeIONContext();
  const { createLock, isPending } = useVeIONActions();
  const { address, isConnected } = useAccount();

  const { data: withdrawalMaxToken } = useBalance({
    address,
    token: getAvailableStakingToken(currentChain, selectedToken),
    chainId: currentChain,
    query: {
      notifyOnChangeProps: ['data', 'error']
    }
  });

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
                max={
                  withdrawalMaxToken
                    ? formatUnits(
                        withdrawalMaxToken.value,
                        withdrawalMaxToken.decimals
                      )
                    : '0'
                }
                amount={amount}
                tokenName={`ion/${selectedToken}`}
                token={getAvailableStakingToken(currentChain, selectedToken)}
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
