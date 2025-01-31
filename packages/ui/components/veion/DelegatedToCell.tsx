import React from 'react';

import Image from 'next/image';

import { formatUnits } from 'viem';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@ui/components/ui/tooltip';
import { getChainName } from '@ui/constants/mock';
import { cn } from '@ui/lib/utils';
import type { ChainId } from '@ui/types/veION';

import type { MarketCellProps } from '../CommonTable';

const sizes = {
  sm: 'gap-1 text-xs p-1',
  md: 'gap-1.5 text-sm p-1.5',
  lg: 'gap-2 text-base p-2'
} as const;

const imageSizes = {
  sm: 16,
  md: 20,
  lg: 24
} as const;

type Size = keyof typeof sizes;

interface BadgePositionTitleProps {
  chainId: ChainId;
  position: number;
  size?: Size;
  className?: string;
  amount?: string; // Add this
}

const BadgePositionTitle = ({
  chainId,
  position,
  size = 'md',
  className,
  amount
}: BadgePositionTitleProps) => {
  const chainName = getChainName(chainId);
  const imageSize = imageSizes[size];

  const formattedAmount = amount ? formatUnits(BigInt(amount), 18) : undefined;

  const badge = (
    <div
      className={cn(
        'flex items-center rounded-full bg-white/10 hover:bg-white/15 transition-colors',
        sizes[size],
        className
      )}
    >
      <Image
        alt={chainName}
        className={`w-${imageSize / 4} h-${imageSize / 4}`}
        src={`/img/logo/${chainName.toUpperCase()}.png`}
        width={imageSize}
        height={imageSize}
      />
      <div className="font-semibold text-white/80">#{position}</div>
    </div>
  );

  if (!formattedAmount) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>Delegated: {Number(formattedAmount).toFixed(4)} BLP</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Update BadgeGrid props to include amounts
interface BadgeGridProps {
  delegatedTo: number[];
  delegatedAmounts?: string[]; // Add this
  chainId: ChainId;
  size?: Size;
}

const BadgeGrid = ({
  delegatedTo,
  delegatedAmounts,
  chainId,
  size = 'md'
}: BadgeGridProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {delegatedTo.map((id: number, index: number) => (
        <BadgePositionTitle
          key={id}
          chainId={chainId}
          position={id}
          size={size}
          amount={delegatedAmounts?.[index]}
        />
      ))}
    </div>
  );
};

// Update cell component to pass amounts
const DelegatedToCell = ({ row }: MarketCellProps) => (
  <BadgeGrid
    delegatedTo={row.original.delegation.delegatedTo}
    delegatedAmounts={row.original.delegation.delegatedAmounts}
    chainId={row.original.chainId}
  />
);

export { BadgePositionTitle, BadgeGrid, DelegatedToCell };
