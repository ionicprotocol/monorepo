import React from 'react';

import Image from 'next/image';

import { Sparkles, TrendingUp } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@ui/components/ui/tooltip';
import type { MorphoRow } from '@ui/types/Earn';

interface MorphoApyCellProps {
  row: {
    original: MorphoRow;
  };
}

const MorphoApyCell: React.FC<MorphoApyCellProps> = ({ row }) => {
  const totalApy = row.original.apy;
  const baseRate = (row.original.rewards.rate || 0) * 100;
  const morphoRewards = row.original.rewards.morpho;
  const ionRewards = row.original.rewards.ION;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">
            {totalApy > 0 ? `${totalApy.toFixed(2)}%` : '∞%'}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="flex flex-col gap-2 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-lg"
        >
          <div className="text-sm font-medium text-gray-300">APY Breakdown</div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Base Rate</span>
              </div>
              <span className="text-xs font-medium">
                {baseRate.toFixed(2)}%
              </span>
            </div>
            {morphoRewards > 0 && (
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/img/symbols/32/color/morpho.png"
                    alt={row.original.protocol}
                    width={20}
                    height={20}
                    className="w-4 h-4"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = '/img/assets/info.png';
                    }}
                  />
                  <span className="text-xs text-gray-400">MORPHO Rewards</span>
                </div>
                <span className="text-xs font-medium text-green-400">
                  +{morphoRewards.toFixed(2)}%
                </span>
              </div>
            )}
            {ionRewards > 0 && (
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/img/symbols/32/color/ion.png"
                    alt="ION"
                    width={20}
                    height={20}
                    className="w-4 h-4"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src = '/img/assets/info.png';
                    }}
                  />
                  <span className="text-xs text-gray-400">ION Rewards</span>
                </div>
                <span className="text-xs font-medium text-purple-400">
                  +{ionRewards.toFixed(2)}%
                </span>
              </div>
            )}
            <div className="h-px bg-gray-700 my-1" />
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-medium text-gray-300">
                  Total APY
                </span>
              </div>
              <span className="text-xs font-medium text-white">
                {totalApy.toFixed(2)}%
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MorphoApyCell;
