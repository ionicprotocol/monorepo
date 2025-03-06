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
// Removed useFusePoolData dependency
import type { ChainId } from '@ui/types/veION';

export const EmissionsStatusTile = () => {
  const { currentChain, emissions } = useVeIONContext();
  // Use veIonBalanceUsd directly from emissions data instead of from prices
  const veIonBalanceUsd = emissions.veIonBalanceUsd;
  const isUserBlacklisted = emissions.isUserBlacklisted;

  // Get the threshold percentage from emissions data (dynamically from contract)
  // Default to 2.5% if not available, for backward compatibility
  const thresholdPercentage = emissions.collateralPercentageNumeric ?? 2.5;

  // Get user's collateral value directly from emissions data
  const userCollateral = emissions.userCollateral
    ? parseFloat(emissions.userCollateral)
    : 0;

  // Use the actual ratio from emissions data if available
  // This is calculated using the same formula as the contract: (userLPValue * MAXIMUM_BASIS_POINTS) / userCollateralValue
  let veionPercentageVsCollateral = emissions.actualRatio;

  // If actualRatio is not available, calculate it manually for backward compatibility
  if (veionPercentageVsCollateral === undefined) {
    veionPercentageVsCollateral =
      userCollateral === 0 && veIonBalanceUsd > 0
        ? 100 // If no collateral and veION exists, count as 100%
        : userCollateral > 0
          ? (veIonBalanceUsd / userCollateral) * 100
          : 0;
  }

  // Determine if the user is active based on blacklist status and veION percentage
  const isActive =
    !isUserBlacklisted && veionPercentageVsCollateral >= thresholdPercentage;

  // For display purposes, cap at 100%
  const displayPercentage =
    veionPercentageVsCollateral > 100 ? 100 : veionPercentageVsCollateral;

  const displayText =
    veionPercentageVsCollateral > 100 ||
    (userCollateral === 0 && veIonBalanceUsd > 0)
      ? '100%+'
      : `${veionPercentageVsCollateral?.toFixed(2)}%`;

  // Calculate progress bar values based on threshold
  const firstBarProgress = Math.min(
    displayPercentage || 0,
    thresholdPercentage
  );
  const secondBarProgress = Math.max(
    0,
    (displayPercentage || 0) - thresholdPercentage
  );
  const secondBarMax = 100 - thresholdPercentage;

  const getStatusDisplay = () => {
    if (isUserBlacklisted) {
      return {
        text: 'Inactive',
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
                  Activation Threshold: {thresholdPercentage.toFixed(1)}% of
                  your collateral worth must be locked as veION.
                </p>
              )}
            </TooltipContent>
          </Tooltip>

          <WhitelistButton />
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
            content={`${displayText} of your collateral is locked as veION (calculated in ETH terms)`}
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
            {(emissions.totalCollateralUsd || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </CustomTooltip>
      </div>
    </div>
  );
};
