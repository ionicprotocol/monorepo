import * as React from 'react';

import { Button, type ButtonProps } from '@ui/components/ui/button';
import { cn } from '@ui/lib/utils';

type TableActionVariant = 'primary' | 'secondary';

interface TableActionButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: TableActionVariant;
  width?: string;
  bgColor?: string;
  hoverBgColor?: string;
  textColor?: string;
  adaptive?: boolean;
}

const TableActionButton = React.forwardRef<
  HTMLButtonElement,
  TableActionButtonProps
>(
  (
    {
      className,
      variant = 'primary',
      width = '80px',
      bgColor,
      hoverBgColor,
      textColor,
      adaptive = false,
      ...props
    },
    ref
  ) => {
    const getStyles = () => {
      if (bgColor) {
        return {
          bg: bgColor,
          hover: hoverBgColor || `${bgColor}/90`,
          text: textColor || 'text-black'
        };
      }

      return variant === 'primary'
        ? { bg: 'bg-accent', hover: 'hover:bg-accent/60', text: 'text-black' }
        : { bg: 'bg-white/10', hover: 'hover:bg-white/20', text: 'text-white' };
    };

    const styles = getStyles();

    return (
      <Button
        ref={ref}
        className={cn(
          'py-1.5 px-3 text-xs font-semibold rounded-xl',
          !adaptive && `w-[${width}]`,
          styles.bg,
          styles.hover,
          styles.text,
          className
        )}
        size="sm"
        {...props}
      />
    );
  }
);
TableActionButton.displayName = 'TableActionButton';

export { TableActionButton };
export type { TableActionButtonProps };
