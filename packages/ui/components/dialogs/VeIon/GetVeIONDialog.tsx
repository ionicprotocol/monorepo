import { useEffect, useMemo, useState } from 'react';

import { LockIcon, TrendingUpIcon } from 'lucide-react';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useBalance } from 'wagmi';

import { LockDurationPicker } from '@ui/components/LockDurationPicker';
import MaxDeposit from '@ui/components/MaxDeposit';
import { usePrecisionSlider } from '@ui/components/PrecisionSlider';
import TransactionButton from '@ui/components/TransactionButton';
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

const MINIMUM_AMOUNT = BigInt('10000000000000000');

interface GetVeIONDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedToken: 'eth' | 'lsk' | 'mode' | 'weth';
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
  const { createLock } = useVeIONActions();
  const { address, isConnected } = useAccount();

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

  async function lockAndGetVeion() {
    try {
      if (!isConnected) {
        console.warn('Wallet not connected');
        return {
          success: false
        };
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

      return {
        success: true
      };
    } catch (err) {
      console.warn(err);
      return {
        success: false
      };
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        setAmount('0');
        handleDurationChange(180);
      }}
    >
      <DialogContent className="bg-black bg-opacity-90 border border-white/10 shadow-2xl backdrop-blur-lg w-full max-w-[520px] p-6">
        {!success ? (
          <>
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent flex items-center gap-2">
                <LockIcon className="size-6 text-white" /> Get veION
              </DialogTitle>
              <p className="text-sm text-white/60">
                Lock your LP tokens to receive veION and participate in
                governance
              </p>
            </DialogHeader>

            <div className="space-y-8 mt-6">
              <div className="space-y-3">
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
                <div className="text-xs text-white/50 px-1 flex items-center gap-2">
                  <TrendingUpIcon className="size-4" />
                  Minimum required: {formatUnits(MINIMUM_AMOUNT, 18)} ION
                  {amount !== '0' && !isAboveMinimum && (
                    <span className="text-red-400 ml-2">
                      (Current amount is below minimum)
                    </span>
                  )}
                </div>
              </div>

              <Separator className="bg-white/5" />

              <LockDurationPicker
                selectedDuration={selectedDuration}
                tooltipContent="Choose the duration of the lock, longer lock gives higher vote multiplier."
                lockDate={lockDate}
                onDurationChange={handleDurationChange}
                onDateChange={setLockDate}
              />

              <TransactionButton
                onSubmit={lockAndGetVeion}
                isDisabled={!isConnected || !amount || !isAboveMinimum}
                buttonText="Lock LP and get veION"
                targetChainId={currentChain}
              />
            </div>
          </>
        ) : (
          <SuccessView
            amount={Number(amount)}
            onClose={() => setSuccess(false)}
            chain={currentChain}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
