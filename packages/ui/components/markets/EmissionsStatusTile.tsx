'use client';

import Link from 'next/link';

import { ExternalLink } from 'lucide-react';

import CustomTooltip from '@ui/components/CustomTooltip';
import { Progress } from '@ui/components/ui/progress';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@ui/components/ui/tooltip';
import { getChainName } from '@ui/constants/mock';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { useFusePoolData } from '@ui/hooks/useFusePoolData';
import type { ChainId } from '@ui/types/veION';

export const EmissionsStatusTile = () => {
  const { prices, currentChain } = useVeIONContext();
  const { veIonBalanceUsd } = prices;

  const { data: marketData } = useFusePoolData(
    currentChain === 34443 ? '1' : '0',
    currentChain
  );

  const yourDeposits =
    (marketData?.totalSupplyBalanceFiat || 0) + veIonBalanceUsd;
  const veionPercentageVsTotalLocked = (veIonBalanceUsd / yourDeposits) * 100;
  const isActive = veionPercentageVsTotalLocked >= 2.5;

  const firstBarProgress = Math.min(veionPercentageVsTotalLocked, 2.5);
  const secondBarProgress = Math.max(0, veionPercentageVsTotalLocked - 2.5);
  const secondBarMax = 97.5;
  const thresholdPercentage = 2.5;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <h3>Emissions:</h3>
              <span className={isActive ? 'text-green-400' : 'text-red-400'}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-background p-2 rounded-md shadow-md">
            <p className="text-sm">
              Activation Threshold: 2.5% of your collateral worth must be locked
              as veION.
            </p>
          </TooltipContent>
        </Tooltip>
        <Link
          href="https://doc.ionic.money/ionic-documentation/tokenomics/stage-2-usdion/veion"
          className="text-green-400 hover:text-green-500 p-0 h-auto flex items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-sm">Learn More</span>
          <ExternalLink className="w-5 h-5 ml-2" />
        </Link>
      </div>

      <div className="flex gap-2">
        <div className="w-full relative group">
          <CustomTooltip
            content={`${veionPercentageVsTotalLocked.toFixed(2)}% of your collateral worth locked as veION`}
          >
            <div className="flex gap-2">
              <div className="w-[10%]">
                <Progress
                  value={(firstBarProgress / thresholdPercentage) * 100}
                  className="[&>div]:rounded-l-md [&>div]:rounded-r-none"
                />
              </div>
              <div className="w-[90%]">
                <Progress
                  value={(secondBarProgress / secondBarMax) * 100}
                  className="[&>div]:rounded-l-none [&>div]:rounded-r-md"
                />
              </div>
            </div>
          </CustomTooltip>
        </div>
      </div>

      <div className="flex justify-between items-center text-gray-400 text-xs">
        <CustomTooltip
          content={`Your total veION on ${getChainName(currentChain as ChainId)}`}
        >
          <span>
            VEION: ${veIonBalanceUsd.toFixed(2)} (
            {veionPercentageVsTotalLocked.toFixed(2)}%)
          </span>
        </CustomTooltip>
        <CustomTooltip
          content={`Your total deposits on ${getChainName(currentChain as ChainId)}`}
        >
          <span>
            DEPOSITS: $
            {yourDeposits.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </CustomTooltip>
      </div>
    </div>
  );
};
