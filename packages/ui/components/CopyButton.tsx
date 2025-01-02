// components/CopyButton.tsx
'use client';

import { useState } from 'react';

import { Copy, CheckCircle } from 'lucide-react';

import { Button } from '@ui/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@ui/components/ui/tooltip';
import { useToast } from '@ui/hooks/use-toast';

interface CopyButtonProps {
  value: string;
  message?: string;
  className?: string;
  tooltipMessage?: string;
}

export function CopyButton({
  value,
  message = 'Copied!',
  className,
  tooltipMessage = 'Copy to clipboard'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({
        description: message,
        duration: 2000
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: 'destructive',
        description: 'Failed to copy to clipboard'
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={`h-3 w-3 min-h-0 min-w-0 p-0 hover:bg-transparent [&_svg]:!size-3 ${className}`}
            onClick={handleCopy}
            onMouseDown={(e) => e.preventDefault()}
          >
            {copied ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 text-gray-400 hover:text-gray-300" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
