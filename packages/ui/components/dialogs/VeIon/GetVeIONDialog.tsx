import { useEffect, useMemo, useState } from 'react';

import { formatUnits, parseUnits } from 'viem';
import { useAccount, useBalance, useSwitchChain } from 'wagmi';

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
import { getChainName } from '@ui/constants/mock';
import { ChainId } from '@ui/types/veION';

const MINIMUM_AMOUNT = BigInt('10000000000000000');

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
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const isAboveMinimum = useMemo(() => {
    if (!amount || amount === '0') return false;
    try {
      const amountInWei = parseUnits(amount, 18);
      return amountInWei >= MINIMUM_AMOUNT;
    } catch {
      return false;
    }
  }, [amount]);

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

  const switchToCorrectChain = async ({ chainId }: { chainId: number }) => {
    try {
      await switchChain({ chainId });
    } catch (switchError) {
      console.error('Failed to switch network:', switchError);
    }
  };

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

  const isButtonDisabled =
    !lockDate || Number(amount) === 0 || !isAboveMinimum || isPending;

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
              <div className="space-y-2">
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
                <div className="text-xs text-white/50 px-1">
                  Minimum required: {formatUnits(MINIMUM_AMOUNT, 18)} ION
                  {amount !== '0' && !isAboveMinimum && (
                    <span className="text-red-400 ml-2">
                      (Current amount is below minimum)
                    </span>
                  )}
                </div>
              </div>

              <Separator className="bg-white/10" />

              <LockDurationPicker
                selectedDuration={selectedDuration}
                lockDate={lockDate}
                onDurationChange={handleDurationChange}
                onDateChange={setLockDate}
              />

              <Separator className="bg-white/10" />

              {chainId !== currentChain ? (
                <Button
                  onClick={() =>
                    switchToCorrectChain({ chainId: currentChain })
                  }
                  className="w-full bg-accent text-black"
                >
                  Switch to {getChainName(currentChain as ChainId)}
                </Button>
              ) : (
                <Button
                  onClick={lockAndGetVeion}
                  className="w-full bg-accent text-black"
                  disabled={isButtonDisabled}
                >
                  {isPending
                    ? 'Locking...'
                    : !isAboveMinimum && amount !== '0'
                      ? 'Amount Below Minimum'
                      : 'Lock LP and get veION'}
                </Button>
              )}
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
