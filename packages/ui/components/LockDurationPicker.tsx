import { useState, useMemo } from 'react';

import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import { Calendar } from '@ui/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@ui/components/ui/popover';

import CustomTooltip from './CustomTooltip';
import { PrecisionSlider } from './PrecisionSlider';

interface LockDurationPickerProps {
  selectedDuration: number;
  lockDate: Date;
  onDurationChange: (duration: number) => void;
  onDateChange: (date: Date) => void;
  baseLockDate?: Date;
  minDuration?: number;
  maxDuration?: number;
  showTooltip?: boolean;
  tooltipContent?: string;
}

const defaultDurationLabels = {
  1: '1d',
  180: '180d',
  365: '1y',
  730: '2y'
};

export function LockDurationPicker({
  selectedDuration,
  lockDate,
  onDurationChange,
  onDateChange,
  baseLockDate = new Date(),
  minDuration = 1,
  maxDuration = 730,
  showTooltip = true,
  tooltipContent = 'A longer lock period gives you more veION for the same amount of LPs, which means a higher voting power.'
}: LockDurationPickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const dateRange = useMemo(() => {
    return {
      minDate: addDays(baseLockDate, minDuration),
      maxDate: addDays(baseLockDate, maxDuration)
    };
  }, [baseLockDate, minDuration, maxDuration]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange?.(date);
      const durationInDays = Math.round(
        (date.getTime() - baseLockDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const clampedDuration = Math.max(
        minDuration,
        Math.min(maxDuration, durationInDays)
      );
      onDurationChange(clampedDuration);
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-white/60 tracking-wider mb-2">
        <p>LOCK UNTIL</p>
        {showTooltip && <CustomTooltip content={tooltipContent} />}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/60">
          {format(lockDate, 'dd MMM yyyy')}
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
              className="border-white/10 text-white"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="pt-6">
        <PrecisionSlider
          value={selectedDuration}
          onChange={(val) => {
            onDurationChange(val);
            onDateChange?.(addDays(baseLockDate, val));
          }}
          max={maxDuration}
          min={minDuration}
          step={1}
          marks={Object.keys(defaultDurationLabels).map(Number)}
        />
      </div>
    </div>
  );
}
