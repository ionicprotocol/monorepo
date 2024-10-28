import { useState, useEffect, useMemo } from 'react';

import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import { Calendar } from '@ui/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@ui/components/ui/popover';
import { Separator } from '@ui/components/ui/separator';
import { Slider } from '@ui/components/ui/slider';

import AutoLock from './AutoLock';
import CustomTooltip from '../CustomTooltip';

export function ExtendView() {
  const [autoLock, setAutoLock] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lockDuration, setLockDuration] = useState<string>('180');
  const [lockDate, setLockDate] = useState<Date>(() =>
    addDays(new Date(), 180)
  );
  const [selectedDuration, setSelectedDuration] = useState<number>(180);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Calculate the valid date range for the calendar
  const dateRange = useMemo(() => {
    const today = new Date();
    return {
      minDate: addDays(today, 180), // Minimum 180 days from today
      maxDate: addDays(today, 730) // Maximum 730 days from today
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

  const handleDurationChange = (val: number[]) => {
    const duration = val[0];
    setSelectedDuration(duration);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setLockDate(date);
      // Calculate duration in days
      const durationInDays = Math.round(
        (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      // Clamp the duration between 180 and 730 days
      const clampedDuration = Math.max(180, Math.min(730, durationInDays));
      setSelectedDuration(clampedDuration);
      setLockDuration(clampedDuration.toString());
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-2 py-2 px-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-white/60 tracking-wider mb-2">
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
              className={selectedDuration >= Number(days) ? 'text-accent' : ''}
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

      <Separator className="bg-white/10 my-4" />

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-2">
          VOTING POWER
          <CustomTooltip content="Your voting power diminishes each day closer to the end of the token lock period." />
        </div>
        <p>0.00 veIon</p>
      </div>

      <div className="flex w-full items-center justify-between text-xs text-white/50">
        LOCKED Until
        <p>28 Aug 2023 → {format(lockDate, 'dd MMM yyyy')}</p>
      </div>

      <Button className="w-full bg-accent text-black mt-4">Extend Lock</Button>
    </div>
  );
}
