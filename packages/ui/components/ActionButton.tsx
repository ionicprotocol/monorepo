import React from 'react';

import Link from 'next/link';

import { cn } from '@ui/lib/utils';

import type { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  half?: boolean;
  action?: () => void;
  href?: string;
  disabled?: boolean;
  label: string;
  bg?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  iconSize?: number;
  target?: '_blank' | '_self';
  className?: string;
}

const baseStyles = `rounded-md py-2.5 px-4 capitalize truncate 
  disabled:opacity-50 hover:opacity-80 
  inline-flex items-center justify-center gap-2`;

const ActionButton: React.FC<ActionButtonProps> = ({
  half,
  action,
  href,
  disabled,
  label,
  bg = 'bg-accent',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  iconSize = 12,
  target,
  className
}) => {
  const classes = cn(
    baseStyles,
    bg,
    'text-black',
    half ? 'w-1/2' : 'w-full',
    className
  );

  const content = (
    <>
      {LeftIcon && <LeftIcon size={iconSize} />}
      <span>{label}</span>
      {RightIcon && <RightIcon size={iconSize} />}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        target={target}
        {...(disabled
          ? { 'aria-disabled': true, onClick: (e) => e.preventDefault() }
          : {})}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      onClick={action}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default ActionButton;
