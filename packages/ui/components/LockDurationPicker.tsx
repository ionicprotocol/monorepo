// LockDurationPicker.tsx
import { useState, useMemo } from 'react';

import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Info } from 'lucide-react';

import { PrecisionSlider } from '@ui/components/PrecisionSlider';
import { Button } from '@ui/components/ui/button';
import { Calendar } from '@ui/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@ui/components/ui/popover';

const MIN_LOCK_DURATION = 180;
const MAX_LOCK_DURATION = 730;

interface LockDurationPickerProps {
  selectedDuration: number;
  lockDate: Date;
  onDurationChange: (duration: number) => void;
  onDateChange: (date: Date) => void;
  baseLockDate?: Date;
  currentDuration?: number;
  maxDuration?: number;
  showTooltip?: boolean;
  tooltipContent?: string;
  isExtending?: boolean;
}

export function LockDurationPicker({
  selectedDuration,
  lockDate,
  onDurationChange,
  onDateChange,
  baseLockDate = new Date(),
  currentDuration = 0,
  maxDuration = MAX_LOCK_DURATION,
  showTooltip = true,
  tooltipContent = 'A longer lock period gives you more veION for the same amount of LPs, which means a higher voting power.',
  isExtending = false
}: LockDurationPickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Calculate effective minimum duration based on whether we're extending or creating
  const effectiveMinDuration = useMemo(() => {
    if (isExtending) {
      // When extending, calculate how many days we need to add to reach MIN_LOCK_DURATION
      const daysNeededForMin = Math.max(0, MIN_LOCK_DURATION - currentDuration);
      return currentDuration + daysNeededForMin;
    } else {
      // When creating, minimum is just MIN_LOCK_DURATION
      return MIN_LOCK_DURATION;
    }
  }, [currentDuration, isExtending]);

  const dateRange = useMemo(() => {
    if (isExtending) {
      // Calculate minimum days needed to reach MIN_LOCK_DURATION
      const minDaysNeeded = Math.max(0, MIN_LOCK_DURATION - currentDuration);

      return {
        minDate: addDays(baseLockDate, minDaysNeeded),
        maxDate: addDays(baseLockDate, MAX_LOCK_DURATION - currentDuration)
      };
    } else {
      return {
        minDate: addDays(baseLockDate, MIN_LOCK_DURATION),
        maxDate: addDays(baseLockDate, MAX_LOCK_DURATION)
      };
    }
  }, [baseLockDate, currentDuration, isExtending]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;

    const durationInDays = Math.round(
      (date.getTime() - baseLockDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const totalDuration = isExtending
      ? currentDuration + durationInDays
      : durationInDays;

    const clampedDuration = Math.max(
      effectiveMinDuration,
      Math.min(maxDuration, totalDuration)
    );

    onDateChange(date);
    onDurationChange(clampedDuration);
  };

  const sliderMarks = [effectiveMinDuration, 365, maxDuration]
    .filter((mark) => mark <= maxDuration && mark >= effectiveMinDuration)
    .sort((a, b) => a - b);

  const handleSliderChange = (duration: number) => {
    const validDuration = Math.max(
      effectiveMinDuration,
      Math.min(maxDuration, duration)
    );

    if (isExtending) {
      const extensionDays = validDuration - currentDuration;
      onDurationChange(validDuration);
      onDateChange(addDays(baseLockDate, extensionDays));
    } else {
      onDurationChange(validDuration);
      onDateChange(addDays(baseLockDate, validDuration));
    }
  };

  const minNeededDays = isExtending
    ? Math.max(0, MIN_LOCK_DURATION - currentDuration)
    : MIN_LOCK_DURATION;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-white/60 tracking-wider mb-2">
        <p>
          {isExtending
            ? minNeededDays > 0
              ? `EXTEND LOCK (min +${minNeededDays} days needed)`
              : 'EXTEND LOCK'
            : `LOCK UNTIL (min ${MIN_LOCK_DURATION} days)`}
        </p>
        {showTooltip && (
          <div
            className="tooltip"
            data-tip={tooltipContent}
          >
            <Info className="h-4 w-4 cursor-help" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/60">
          {format(lockDate, 'dd MMM yyyy')}
          {isExtending && (
            <span className="ml-2 text-xs text-white/40">
              (Current: {format(baseLockDate, 'dd MMM yyyy')})
            </span>
          )}
        </div>
        <Popover
          modal={true}
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
            onClick={(e) => e.stopPropagation()}
          >
            <Calendar
              mode="single"
              selected={lockDate}
              onSelect={handleCalendarSelect}
              disabled={{
                before: dateRange.minDate,
                after: dateRange.maxDate
              }}
              month={lockDate}
              defaultMonth={lockDate}
              className="border-white/10 text-white"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="pt-6">
        <PrecisionSlider
          value={selectedDuration}
          onChange={handleSliderChange}
          max={maxDuration}
          min={effectiveMinDuration}
          step={1}
          marks={sliderMarks}
          className="mt-6"
        />
        <div className="flex justify-between mt-2 text-xs text-white/60">
          <span>
            {isExtending
              ? `Current: ${currentDuration}d${minNeededDays > 0 ? ` (need +${minNeededDays}d min)` : ''}`
              : `Min: ${MIN_LOCK_DURATION}d`}
          </span>
          <span>{maxDuration}d (max)</span>
        </div>
        {isExtending && (
          <div className="mt-2 text-xs text-white/40">
            Total duration after extension: {selectedDuration}d
          </div>
        )}
      </div>
    </div>
  );
}
