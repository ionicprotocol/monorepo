'use client';

import { useState, useEffect, useMemo } from 'react';

import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import { Calendar } from '@ui/components/ui/calendar';
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
} from '@ui/components/ui/popover';
import { Separator } from '@ui/components/ui/separator';
import { Slider } from '@ui/components/ui/slider';

import AutoLock from './AutoLock';
import CustomTooltip from '../CustomTooltip';

interface ExtendVeionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentVotingPower?: string;
  currentLockDate?: string;
  maxToken?: number;
}

const ExtendVeion = ({
  isOpen,
  onOpenChange,
  currentVotingPower = '20.00',
  currentLockDate = '28 Aug 2023',
  maxToken = 100
}: ExtendVeionProps) => {
  const [autoLock, setAutoLock] = useState(false);
  const [lockDuration, setLockDuration] = useState<string>('180');
  // eslint-disable-next-line no-console
  console.log('lockDuration', lockDuration);
  const [lockDate, setLockDate] = useState<Date>(() =>
    addDays(new Date(), 180)
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(180);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [veIonAmount, setVeIonAmount] = useState('0');
  const [utilization, setUtilization] = useState(0);

  const dateRange = useMemo(() => {
    const today = new Date();
    return {
      minDate: addDays(today, 180),
      maxDate: addDays(today, 730)
    };
  }, []);

  const durationLabels = {
    180: '180d',
    365: '1y',
    547: '1.5y',
    730: '2y'
  };

  useEffect(() => {
    const newDate = addDays(new Date(), selectedDuration);
    setLockDate(newDate);
    setLockDuration(selectedDuration.toString());
  }, [selectedDuration]);

  useEffect(() => {
    setUtilization(Number(((+veIonAmount / maxToken) * 100).toFixed(0)) ?? 0);
  }, [veIonAmount, maxToken]);

  const handleDurationChange = (val: number[]) => {
    const duration = val[0];
    setSelectedDuration(duration);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setLockDate(date);
      const durationInDays = Math.round(
        (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const clampedDuration = Math.max(180, Math.min(730, durationInDays));
      setSelectedDuration(clampedDuration);
      setLockDuration(clampedDuration.toString());
      setIsCalendarOpen(false);
    }
  };

  const handleUtilizationChange = (val: number[]) => {
    const utilizationValue = val[0];
    setUtilization(utilizationValue);
    const veionval = (utilizationValue / 100) * maxToken;
    setVeIonAmount(veionval.toString());
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-grayone border border-grayUnselect sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Extend veION</DialogTitle>
        </DialogHeader>

        <div className="flex gap-5 text-xs">
          <span className="text-white/50">
            Voting Power: {currentVotingPower} veION
          </span>
          <span className="text-white/50">Locked Until: {currentLockDate}</span>
        </div>

        <div className="space-y-4">
          {/* Amount Slider */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <p>AMOUNT</p>
              <CustomTooltip content="Select the amount of tokens to lock" />
            </div>
            <Slider
              value={[utilization]}
              onValueChange={handleUtilizationChange}
              max={100}
              min={0}
              step={1}
              className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-0"
            />
            <div className="text-xs text-white/60">
              {veIonAmount} / {maxToken} ION
            </div>
          </div>

          {/* Lock Duration */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/60 tracking-wider">
              <p>LOCK UNTIL</p>
              <CustomTooltip content="A longer lock period gives you more veION for the same amount of LPs, which means a higher voting power." />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                {format(lockDate, 'dd. MM. yyyy')}
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
                    <CalendarIcon className="h-4 w-4 text-white/60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-grayUnselect border-white/10"
                  sideOffset={5}
                >
                  <Calendar
                    mode="single"
                    selected={lockDate}
                    onSelect={handleDateSelect}
                    disabled={{
                      before: dateRange.minDate,
                      after: dateRange.maxDate
                    }}
                    defaultMonth={dateRange.minDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Slider
              value={[selectedDuration]}
              onValueChange={handleDurationChange}
              max={730}
              min={180}
              step={1}
              className="[&_[role=slider]]:bg-accent [&_[role=slider]]:border-0"
            />
            <div className="w-full flex justify-between text-xs text-white/60">
              {Object.entries(durationLabels).map(([days, label]) => (
                <span
                  key={days}
                  className={
                    selectedDuration >= Number(days) ? 'text-accent' : ''
                  }
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <AutoLock
            autoLock={autoLock}
            setAutoLock={setAutoLock}
          />

          <Separator className="bg-white/10" />

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/50">
              <div className="flex items-center gap-2">
                VOTING POWER
                <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
              </div>
              <span>
                {currentVotingPower} → {veIonAmount} veION
              </span>
            </div>
            <div className="flex justify-between text-xs text-white/50">
              <span>LOCKED Until</span>
              <span>
                {currentLockDate} → {format(lockDate, 'dd MMM yyyy')}
              </span>
            </div>
          </div>

          <Button className="w-full bg-accent text-black">Extend Lock</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtendVeion;
