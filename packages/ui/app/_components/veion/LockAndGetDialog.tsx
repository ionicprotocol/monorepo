import { useState } from 'react';

import { base, optimism, mode } from 'viem/chains';
import { useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import { useVeION } from '@ui/context/VeIonContext';
import { useVeIONActions } from '@ui/hooks/veion/useVeIONActions';
import { getToken, getAvailableStakingToken } from '@ui/utils/getStakingTokens';

import AutoLock from './AutoLock';
import CustomTooltip from '../CustomTooltip';
import { LockDurationPicker } from '../LockDurationPicker';
import NetworkDropdown from '../NetworkDropdown';
import { PrecisionSlider, usePrecisionSlider } from '../PrecisionSlider';
import MaxDeposit from '../stake/MaxDeposit';

interface VeIonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedToken: 'eth' | 'mode' | 'weth';
}

export default function VeIonDialog({
  isOpen,
  onOpenChange,
  selectedToken
}: VeIonDialogProps) {
  const [lockDate, setLockDate] = useState<Date>(() => new Date());
  const [autoLock, setAutoLock] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const { isConnected } = useAccount();
  const { currentChain, getTokenBalance } = useVeION();
  const { createLock, isPending } = useVeIONActions();

  const maxtoken = Number(getTokenBalance(selectedToken));

  const {
    amount: veIonAmount,
    percentage: utilization,
    handleAmountChange: handleVeIonChange,
    handlePercentageChange: handleUtilizationChange
  } = usePrecisionSlider({
    maxValue: maxtoken,
    initialValue: 0,
    precision: 4
  });

  const { amount: selectedDuration, handleAmountChange: handleDurationChange } =
    usePrecisionSlider({
      maxValue: 730,
      initialValue: 180
    });

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
        tokenAmount: veIonAmount.toString(),
        duration: selectedDuration,
        stakeUnderlying: true
      });
      setSuccess(true);
    } catch (err) {
      console.warn(err);
    }
  }

  const isButtonDisabled = !lockDate || veIonAmount === 0 || isPending;

  const utilizationMarks = [0, 25, 50, 75, 100];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayUnselect sm:max-w-[625px]">
        {!success ? (
          <>
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle className="flex items-center gap-4">
                Get veION
                <NetworkDropdown
                  dropdownSelectedChain={currentChain}
                  nopool
                  enabledChains={[mode.id, base.id, optimism.id]}
                />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <MaxDeposit
                headerText="LOCK AMOUNT"
                max={maxtoken.toString()}
                amount={veIonAmount.toString()}
                tokenName="ion/eth LP"
                token={getToken(currentChain)}
                handleInput={(val?: string) => {
                  handleVeIonChange(Number(val || 0));
                }}
                chain={currentChain}
              />
              <div className="w-full mx-auto mt-3 mb-5">
                <PrecisionSlider
                  value={utilization}
                  onChange={handleUtilizationChange}
                  marks={utilizationMarks}
                />
              </div>

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

              <VotingPowerInfo amount={veIonAmount} />

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
            amount={veIonAmount}
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
      <img
        src="/api/placeholder/48/48"
        alt="success"
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
