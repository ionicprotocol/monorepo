'use client';

import * as React from 'react';

import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@ui/lib/utils';

type Mark = {
  value: number;
  label: string;
  isDisabled?: boolean;
};

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  marks?: Mark[];
  onMarkClick?: (value: number) => void;
  currentPosition?: number;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    { className, value, marks, onMarkClick, currentPosition, ...props },
    ref
  ) => {
    const percentage = value ? value[0] : 0;
    const getColor = () => (percentage <= 50 ? 'bg-accent' : 'bg-lime');

    return (
      <div className="space-y-2">
        {marks && (
          <div className="relative w-full h-4">
            {marks.map((mark) => {
              const position =
                ((mark.value - (props.min || 0)) /
                  ((props.max || 100) - (props.min || 0))) *
                100;
              return (
                <span
                  key={mark.value}
                  className={cn(
                    'absolute text-xs -translate-x-1/4',
                    mark.isDisabled
                      ? 'text-white/20 cursor-not-allowed'
                      : 'cursor-pointer',
                    currentPosition === mark.value && 'text-lime',
                    value && value[0] === mark.value && '!text-accent'
                  )}
                  style={{ left: `${position}%` }}
                  onClick={() => {
                    if (!mark.isDisabled && onMarkClick) {
                      onMarkClick(mark.value);
                    }
                  }}
                >
                  {mark.label}
                </span>
              );
            })}
          </div>
        )}
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
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
