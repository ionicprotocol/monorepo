import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

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
import InfoPopover from './InfoPopover';
import LockDuration from './LockDuration';
import SliderComponent from '../popup/Slider';
import MaxDeposit from '../stake/MaxDeposit';

interface VeIonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VeIonDialog({
  isOpen,
  onOpenChange
}: VeIonDialogProps) {
  const chainId = useChainId();
  const searchParams = useSearchParams();
  const querychain = searchParams.get('chain');
  const chain = querychain ? querychain : String(chainId);
  const [veIonAmount, setVeIonAmount] = useState<string>('');
  const [utilization, setUtilization] = useState<number>(0);
  const [lockDuration, setLockDuration] = useState<string>('');
  const [autoLock, setAutoLock] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const maxtoken = '100';

  useEffect(() => {
    setUtilization(
      Number(((+veIonAmount / Number(maxtoken)) * 100).toFixed(0))
    );
  }, [veIonAmount]);

  const { isConnected } = useAccount();

  async function lockAndGetVeion() {
    try {
      const isSwitched = await handleSwitchOriginChain(+chain, chainId);
      if (!isSwitched) return;
      if (!isConnected) {
        console.warn('Wallet not connected');
        return;
      }
      const args = {
        tokenAddress: '0xabced',
        tokenAmount: veIonAmount,
        duration: lockDuration
      };

      // eslint-disable-next-line no-console
      console.log(args);
      setSuccess(true);
    } catch (err) {
      console.warn(err);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayUnselect sm:max-w-[425px]">
        {!success ? (
          <>
            <DialogHeader>
              <DialogTitle>Get veION</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <MaxDeposit
                headerText="Lock Amount"
                max={maxtoken}
                amount={veIonAmount}
                tokenName="ion/eth LP"
                token={getToken(+chain)}
                handleInput={(val?: string) => {
                  setVeIonAmount(val || '');
                }}
                chain={+chain}
              />
              <SliderComponent
                currentUtilizationPercentage={utilization}
                handleUtilization={(val?: number) => {
                  if (!val) return;
                  const veionval = (Number(val) / 100) * Number(maxtoken);
                  setVeIonAmount(veionval.toString());
                }}
              />
              <LockDuration setLockDuration={setLockDuration} />
              <AutoLock
                autoLock={autoLock}
                setAutoLock={setAutoLock}
              />
              <Separator className="bg-white/10" />
              <div className="flex w-full items-center justify-between text-xs text-white/50">
                <div className="flex items-center gap-1">
                  VOTING POWER
                  <InfoPopover content="Your voting power diminishes each day closer to the end of the token lock period." />
                </div>
                <p>0.00 veIon</p>
              </div>
              <Button
                onClick={lockAndGetVeion}
                className="w-full bg-accent text-black"
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
              src="/img/success.png"
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
