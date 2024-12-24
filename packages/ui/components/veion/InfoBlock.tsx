import Image from 'next/image';

import type { InfoBlock } from '@ui/constants/mock';

import CustomTooltip from '../CustomTooltip';

interface InfoBlockProps {
  block: InfoBlock;
}

const InfoBlockComponent: React.FC<InfoBlockProps> = ({ block }) => (
  <div className="flex flex-col gap-1 mt-3">
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
    </div>
  </div>
);

export default InfoBlockComponent;
