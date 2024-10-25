import { Info } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@ui/components/ui/tooltip';

const CustomTooltip = ({
  content,
  color
}: {
  content: string;
  color?: string;
}) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`w-4 h-4 inline-flex items-center justify-center rounded-full text-xs cursor-help ${color}`}
        >
          <Info />
        </div>
      </TooltipTrigger>
      <TooltipContent
        className="bg-grayUnselect text-white border-white/10"
        sideOffset={5}
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default CustomTooltip;
