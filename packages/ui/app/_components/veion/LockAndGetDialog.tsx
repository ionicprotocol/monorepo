import { useEffect, useState } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar } from 'lucide-react';
import { base, optimism, mode } from 'viem/chains';
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
import { getToken } from '@ui/utils/getStakingTokens';
import { handleSwitchOriginChain } from '@ui/utils/NetworkChecker';

import { PrecisionSlider, usePrecisionSlider } from '../PrecisionSlider';
import AutoLock from './AutoLock';
import CustomTooltip from '../CustomTooltip';
import NetworkDropdown from '../NetworkDropdown';
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
  const [lockDate, setLockDate] = useState<Date>();
  const [autoLock, setAutoLock] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const maxtoken = 100;
  const { isConnected } = useAccount();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Use the precision slider hook for veION amount
  const {
    amount: veIonAmount,
    percentage: utilization,
    handleAmountChange: handleVeIonChange,
    handlePercentageChange: handleUtilizationChange
  } = usePrecisionSlider({
    maxValue: maxtoken,
    initialValue: 0
  });

  // Use another instance for duration
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

  const handleDurationSliderChange = (duration: number) => {
    handleDurationChange(duration);
    const newDate = addDays(new Date(), duration);
    setLockDate(newDate);
  };

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

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-white/60 tracking-wider mb-2">
                  <p>LOCK UNTIL</p>
                  <CustomTooltip content="A longer lock period gives you more veION for the same amount of LPs, which means a higher voting power." />
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
                          if (date) {
                            setLockDate(date);
                            const durationInDays = Math.round(
                              (date.getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            );
                            handleDurationChange(durationInDays);
                          }
                          setIsCalendarOpen(false);
                        }}
                        disabled={{ before: new Date() }}
                        className="border-white/10 text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <PrecisionSlider
                  value={selectedDuration}
                  onChange={handleDurationSliderChange}
                  max={730}
                  min={180}
                  step={1}
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
