import type { ReactNode } from 'react';

import { Info } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@ui/components/ui/tooltip';

interface CustomTooltipProps {
  content: string;
  color?: string;
  children?: ReactNode;
}

const CustomTooltip = ({ content, color, children }: CustomTooltipProps) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        {children || (
          <div
            className={`w-4 h-4 inline-flex items-center justify-center rounded-full text-xs cursor-help ${color}`}
          >
            <Info />
          </div>
        )}
      </TooltipTrigger>
      <TooltipContent
        className="bg-grayUnselect text-white border-white/10 max-w-sm"
        sideOffset={5}
      >
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default CustomTooltip;
