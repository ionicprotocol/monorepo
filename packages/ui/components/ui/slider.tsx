'use client';

import * as React from 'react';

import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@ui/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const percentage = value ? value[0] : 0;
  const getColor = () => (percentage <= 50 ? 'bg-accent' : 'bg-lime');
  const getTextColor = () => (percentage <= 50 ? 'text-accent' : 'text-lime');
  const percentages = [0, 20, 40, 60, 80, 100];

  return (
    <div className="space-y-2">
      <div className="relative w-full h-4">
        {percentages.map((percent) => (
          <span
            key={percent}
            className={cn(
              'absolute text-xs text-white/25 -translate-x-1/2',
              percentage === percent && getTextColor()
            )}
            style={{ left: `${percent}%` }}
          >
            {percent}%
          </span>
        ))}
      </div>
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        value={value}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-graylite">
          <SliderPrimitive.Range
            className={cn('absolute h-full', getColor())}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-4 w-4 rounded-full transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
            getColor()
          )}
        />
      </SliderPrimitive.Root>
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
