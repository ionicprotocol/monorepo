import * as React from 'react';

import { cn } from '@ui/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, min, max, onChange, ...props }, ref) => {
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'number') {
          const value = parseFloat(e.target.value);
          if (!isNaN(value)) {
            if (max != null) {
              const maxValue = typeof max === 'string' ? parseFloat(max) : max;
              if (value > maxValue) {
                e.target.value = maxValue.toString();
              }
            }
            if (min != null) {
              const minValue = typeof min === 'string' ? parseFloat(min) : min;
              if (value < minValue) {
                e.target.value = minValue.toString();
              }
            }
          }
        }
        onChange?.(e);
      },
      [type, min, max, onChange]
    );

    return (
      <input
        ref={ref}
        type={type}
        min={min}
        max={max}
        onChange={handleChange}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
