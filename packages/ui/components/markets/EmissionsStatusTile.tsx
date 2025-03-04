'use client';

import Link from 'next/link';

import { ExternalLink } from 'lucide-react';

import CustomTooltip from '@ui/components/CustomTooltip';
import { WhitelistButton } from '@ui/components/markets/WhitelistButton';
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
  const { prices, currentChain, emissions } = useVeIONContext();
  const { veIonBalanceUsd } = prices;
  const isUserBlacklisted = emissions.isUserBlacklisted;

  const { data: marketData } = useFusePoolData(
    currentChain === 34443 ? '1' : '0',
    currentChain
  );

  // Compare veION to total supply
  const totalSupply = marketData?.totalSupplyBalanceFiat || 0;
  const veionPercentageVsTotalSupply =
    totalSupply === 0 && veIonBalanceUsd > 0
      ? 100 // If no collateral and veION exists, count as 100%
      : totalSupply > 0
        ? (veIonBalanceUsd / totalSupply) * 100
        : 0;

  const isActive = !isUserBlacklisted && veionPercentageVsTotalSupply >= 2.5;

  const displayPercentage =
    veionPercentageVsTotalSupply > 100 ? 100 : veionPercentageVsTotalSupply;
  const displayText =
    veionPercentageVsTotalSupply > 100 ||
    (totalSupply === 0 && veIonBalanceUsd > 0)
      ? '100%+'
      : `${veionPercentageVsTotalSupply.toFixed(2)}%`;

  const firstBarProgress = Math.min(displayPercentage, 2.5);
  const secondBarProgress = Math.max(0, displayPercentage - 2.5);
  const secondBarMax = 97.5;
  const thresholdPercentage = 2.5;

  const getStatusDisplay = () => {
    if (isUserBlacklisted) {
      return {
        text: 'Inactive (Blacklisted)',
        color: 'text-red-400'
      };
    }
    return {
      text: isActive ? 'Active' : 'Inactive',
      color: isActive ? 'text-green-400' : 'text-red-400'
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <h3>Emissions:</h3>
                <span className={statusDisplay.color}>
                  {statusDisplay.text}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-background p-2 rounded-md shadow-md">
              {isUserBlacklisted ? (
                <p className="text-sm">
                  Your address has been blacklisted from receiving emissions.
                  You may be able to whitelist yourself using the Whitelist
                  button.
                </p>
              ) : (
                <p className="text-sm">
                  Activation Threshold: 2.5% of your collateral worth must be
                  locked as veION.
                </p>
              )}
            </TooltipContent>
          </Tooltip>

          {isUserBlacklisted && <WhitelistButton />}
        </div>

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
            content={`${displayText} of your total supply locked as veION`}
          >
            <div className="flex gap-2">
              <div className="w-[10%]">
                <Progress
                  value={(firstBarProgress / thresholdPercentage) * 100}
                  className={`[&>div]:rounded-l-md [&>div]:rounded-r-none ${isUserBlacklisted ? 'opacity-50' : ''}`}
                />
              </div>
              <div className="w-[90%]">
                <Progress
                  value={(secondBarProgress / secondBarMax) * 100}
                  className={`[&>div]:rounded-l-none [&>div]:rounded-r-md ${isUserBlacklisted ? 'opacity-50' : ''}`}
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
            YOUR VEION: ${veIonBalanceUsd.toFixed(2)} ({displayText})
          </span>
        </CustomTooltip>
        <CustomTooltip
          content={`Your total supply on ${getChainName(currentChain as ChainId)}`}
        >
          <span>
            YOUR COLLATERAL: $
            {totalSupply.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </CustomTooltip>
      </div>
    </div>
  );
};
