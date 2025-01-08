import React from 'react';
import Image from 'next/image';
import { getChainName } from '@ui/constants/mock';
import type { ChainId } from '@ui/types/VeIION';
import { cn } from '@ui/lib/utils';

const sizes = {
  sm: 'gap-1.5 text-xs',
  md: 'gap-2 text-sm',
  lg: 'gap-2 text-base'
} as const;

const imageSizes = {
  sm: 16,
  md: 24,
  lg: 32
} as const;

type Size = keyof typeof sizes;

interface PositionTitleProps {
  chainId: ChainId;
  position: number;
  size?: Size;
  className?: string;
}

const PositionTitle = ({
  chainId,
  position,
  size = 'md',
  className
}: PositionTitleProps) => {
  const chainName = getChainName(chainId);
  const imageSize = imageSizes[size];

  return (
    <div className={cn('flex items-center', sizes[size], className)}>
      <Image
        alt={chainName}
        className={`w-${imageSize / 4} h-${imageSize / 4}`}
        src={`/img/logo/${chainName.toUpperCase()}.png`}
        width={imageSize}
        height={imageSize}
      />
      <span className="font-medium text-white/60">{chainName}</span>
      <div className="font-semibold text-white/80">#{position}</div>
    </div>
  );
};

export default PositionTitle;
