import React from 'react';

import Image from 'next/image';

import { getChainName } from '@ui/constants/mock';
import { cn } from '@ui/lib/utils';
import type { ChainId } from '@ui/types/VeIION';

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
}

const BadgePositionTitle = ({
  chainId,
  position,
  size = 'md',
  className
}: BadgePositionTitleProps) => {
  const chainName = getChainName(chainId);
  const imageSize = imageSizes[size];

  return (
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
};

// Container component for multiple badges
interface BadgeGridProps {
  delegatedTo: number[];
  chainId: ChainId;
  size?: Size;
}

const BadgeGrid = ({ delegatedTo, chainId, size = 'md' }: BadgeGridProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {delegatedTo.map((id: number) => (
        <BadgePositionTitle
          key={id}
          chainId={chainId}
          position={id}
          size={size}
        />
      ))}
    </div>
  );
};

// Updated cell component
const DelegatedToCell = ({ row }: MarketCellProps) => (
  <BadgeGrid
    delegatedTo={row.original.delegation.delegatedTo}
    chainId={row.original.chainId}
  />
);

export { BadgePositionTitle, BadgeGrid, DelegatedToCell };
