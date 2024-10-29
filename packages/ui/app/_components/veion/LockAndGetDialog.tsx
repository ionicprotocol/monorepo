// VeIonDialog.tsx
import { useState } from 'react';

import { base, optimism, mode } from 'viem/chains';
import { useChainId, useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import { Separator } from '@ui/components/ui/separator';
import { getToken } from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import AutoLock from './AutoLock';
import CustomTooltip from '../CustomTooltip';
import { LockDurationPicker } from '../LockDurationPicker';
import NetworkDropdown from '../NetworkDropdown';
import { PrecisionSlider, usePrecisionSlider } from '../PrecisionSlider';
import MaxDeposit from '../stake/MaxDeposit';

interface VeIonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chain: number;
  selectedToken: 'eth' | 'mode' | 'weth';
}

export default function VeIonDialog({
  isOpen,
  onOpenChange,
  chain,
  selectedToken
}: VeIonDialogProps) {
  // eslint-disable-next-line no-console
  console.log('selectedToken', selectedToken);
  const chainId = useChainId();
  const [lockDate, setLockDate] = useState<Date>(() => new Date());
  const [autoLock, setAutoLock] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const maxtoken = 100;
  const { isConnected } = useAccount();

  const {
    amount: veIonAmount,
    percentage: utilization,
    handleAmountChange: handleVeIonChange,
    handlePercentageChange: handleUtilizationChange
  } = usePrecisionSlider({
    maxValue: maxtoken,
    initialValue: 0
  });

  const { amount: selectedDuration, handleAmountChange: handleDurationChange } =
    usePrecisionSlider({
      maxValue: 730,
      initialValue: 180
    });

  async function lockAndGetVeion() {
    try {
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const args = {
        tokenAddress: '0xabced',
        tokenAmount: veIonAmount.toString(),
        duration: selectedDuration.toString()
      };
      setSuccess(true);
    } catch (err) {
      console.warn(err);
    }
  }

  const isButtonDisabled = !lockDate || veIonAmount === 0;

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
                  dropdownSelectedChain={+chain}
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
                token={getToken(+chain)}
                handleInput={(val?: string) => {
                  handleVeIonChange(Number(val || 0));
                }}
                chain={+chain}
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
              <div className="flex w-full items-center justify-between text-xs text-white/50">
                <div className="flex items-center gap-2">
                  VOTING POWER
                  <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
                </div>
                <p className="text-white">0.00 veIon</p>
              </div>
              <Button
                onClick={lockAndGetVeion}
                className="w-full bg-accent text-black"
                disabled={isButtonDisabled}
              >
                Lock LP and get veION
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-y-4 py-2">
            <DialogHeader>
              <DialogTitle>Congratulations!</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-white/60">
              Successfully locked {maxtoken} LP tokens for 12 veION, resulting
              in x amount of voting power.
              <br /> <br />
              Proceed to your veION Overview to vote on your favorite Market.
            </p>
            <img
              src="/api/placeholder/48/48"
              alt="success"
              className="w-12 mx-auto h-12"
            />
            <Button
              onClick={() => setSuccess(false)}
              className="w-full bg-accent text-black"
            >
              Back to Overview
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
