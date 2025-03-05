'use client';

import { Button } from '@ui/components/ui/button';
import { useVeIONContext } from '@ui/context/VeIonContext';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@ui/components/ui/tooltip';

interface WhitelistButtonProps {
  className?: string;
}

export function WhitelistButton({ className = '' }: WhitelistButtonProps) {
  const { emissions } = useVeIONContext();
  const {
    isUserBlacklisted,
    whitelistUser,
    actualRatio,
    collateralPercentageNumeric,
    veIonBalanceUsd,
    totalCollateralUsd
  } = emissions;

  // Don't show button if user is not blacklisted
  if (!isUserBlacklisted) {
    return null;
  }

  // Check if user meets the ratio requirement
  const meetsRatioRequirement =
    actualRatio !== undefined &&
    collateralPercentageNumeric !== undefined &&
    actualRatio >= collateralPercentageNumeric;

  // Has enough veION value compared to their collateral
  const hasEnoughVeION =
    veIonBalanceUsd > 0 &&
    totalCollateralUsd !== undefined &&
    totalCollateralUsd > 0;

  // Client-side eligibility check (more efficient than relying only on simulation)
  const eligibleToWhitelist = meetsRatioRequirement && hasEnoughVeION;

  // Determine reason why user can't whitelist
  let ineligibilityReason = '';
  if (!meetsRatioRequirement) {
    ineligibilityReason = `Your veION ratio (${actualRatio?.toFixed(2)}%) is below the required threshold (${collateralPercentageNumeric?.toFixed(2)}%)`;
  } else if (!hasEnoughVeION) {
    ineligibilityReason =
      'You need to have veION tokens staked to be whitelisted';
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={whitelistUser.execute}
            disabled={
              whitelistUser.isPending ||
              whitelistUser.isSimulating ||
              !eligibleToWhitelist ||
              !whitelistUser.canWhitelist
            }
            className={`ml-2 ${
              eligibleToWhitelist
                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-300'
                : 'bg-amber-100 text-amber-700 border-amber-300'
            } 
              transition-all duration-300 font-medium flex items-center gap-1 ${className}`}
          >
            {whitelistUser.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Activating...</span>
              </>
            ) : whitelistUser.isSimulating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : !eligibleToWhitelist ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Ineligible</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Activate</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        {!eligibleToWhitelist && ineligibilityReason && (
          <TooltipContent>
            <p>{ineligibilityReason}</p>
            <p className="text-xs mt-1">
              Lock more veION tokens to increase your ratio and become eligible
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
