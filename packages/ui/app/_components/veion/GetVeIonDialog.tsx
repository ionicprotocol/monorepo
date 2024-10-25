import { useEffect, useState } from 'react';

import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { useChainId, useAccount } from 'wagmi';

import { Button } from '@ui/components/ui/button';
import { Calendar as CalendarComponent } from '@ui/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@ui/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@ui/components/ui/popoverDialog';
import { Separator } from '@ui/components/ui/separator';
import { Slider } from '@ui/components/ui/slider';
import { getToken } from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import AutoLock from './AutoLock';
import CustomTooltip from '../CustomTooltip';
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
  const chainId = useChainId();
  const [veIonAmount, setVeIonAmount] = useState<string>('');
  const [utilization, setUtilization] = useState<number>(0);
  const [lockDate, setLockDate] = useState<Date>();
  const [autoLock, setAutoLock] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const maxtoken = '100';
  const { isConnected } = useAccount();
  const [selectedDuration, setSelectedDuration] = useState<number>(180);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    setUtilization(
      Number(((+veIonAmount / Number(maxtoken)) * 100).toFixed(0))
    );
  }, [veIonAmount]);

  const utilizationMarks = [0, 25, 50, 75, 100];

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
        duration: selectedDuration.toString()
      };

      // eslint-disable-next-line no-console
      console.log(args);
      setSuccess(true);
    } catch (err) {
      console.warn(err);
    }
  }

  const isButtonDisabled = !lockDate || Number(veIonAmount) === 0;

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
                headerText="LOCK AMOUNT"
                max={maxtoken}
                amount={veIonAmount}
                tokenName="ion/eth LP"
                token={getToken(+chain)}
                handleInput={(val?: string) => {
                  setVeIonAmount(val || '');
                }}
                chain={+chain}
              />
              <div className="w-full max-w-md mx-auto mt-3 mb-5">
                <div className="w-full mb-2 text-xs flex justify-between text-white/25">
                  {utilizationMarks.map((mark) => (
                    <span
                      key={mark}
                      className={utilization >= mark ? 'text-accent' : ''}
                    >
                      {mark}%
                    </span>
                  ))}
                </div>
                <Slider
                  value={[utilization]}
                  onValueChange={(val) => {
                    const newVal = val[0];
                    setUtilization(newVal);
                    const veionval = (Number(newVal) / 100) * Number(maxtoken);
                    setVeIonAmount(veionval.toString());
                  }}
                  max={100}
                  step={1}
                  className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-0"
                />
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-2">
                <div className="text-xs text-white/60 uppercase tracking-wider mb-2">
                  LOCK UNTIL
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/60">
                    {lockDate ? format(lockDate, 'dd. MM. yyyy') : 'DD MM YYYY'}
                  </div>
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent"
                      >
                        <Calendar className="h-4 w-4 text-white/60" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-grayUnselect border-white/10"
                      sideOffset={5}
                    >
                      <CalendarComponent
                        mode="single"
                        selected={lockDate}
                        onSelect={(date) => {
                          setLockDate(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={{ before: new Date() }}
                        className="border-white/10 text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Slider
                  value={[selectedDuration]}
                  onValueChange={(val) => setSelectedDuration(val[0])}
                  max={730}
                  min={180}
                  step={1}
                  className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-0"
                />
                <div className="w-full flex justify-between text-xs text-white/60">
                  <span>180d</span>
                  <span>1y</span>
                  <span>1.5y</span>
                  <span>2y</span>
                </div>
              </div>

              <AutoLock
                autoLock={autoLock}
                setAutoLock={setAutoLock}
              />
              <Separator className="bg-white/10" />
              <div className="flex w-full items-center justify-between text-xs text-white/50">
                <div className="flex items-center gap-1">
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
