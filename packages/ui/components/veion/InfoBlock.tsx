import type { ReactNode } from 'react';
import React from 'react';

import Image from 'next/image';

import CustomTooltip from '../CustomTooltip';

export interface InfoBlockType {
  label: string;
  value: ReactNode | string;
  icon: string | null;
  infoContent: string;
  secondaryValue?: string;
}

interface InfoBlockProps {
  block: InfoBlockType;
  className?: string;
}

const InfoBlockComponent: React.FC<InfoBlockProps> = ({ block, className }) => (
  <div className={`flex flex-col gap-1 mt-3 ${className || ''}`}>
    <div className="text-white/60 text-xs flex items-center gap-1">
      {block.label}
      <CustomTooltip content={block.infoContent} />
    </div>
    <div className="text-white/60 text-xs flex items-center">
      {block.icon && (
        <Image
          alt={`${block.label} icon`}
          className="w-6 h-6 inline-block mr-1"
          src={block.icon}
          width={24}
          height={24}
        />
      )}
      <span className="text-white text-sm">{block.value}</span>
      {block.secondaryValue && (
        <span className="text-white/60 ml-2">{block.secondaryValue}</span>
      )}
    </div>
  </div>
);

export default InfoBlockComponent;
