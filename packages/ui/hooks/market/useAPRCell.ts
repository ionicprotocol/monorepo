import { useMemo } from 'react';

import type { APRCellProps } from '@ui/components/markets/Cells/APR';
import { useMarketEmissions } from '@ui/hooks/market/useMarketEmissions';
import { useMerklData } from '@ui/hooks/useMerklData';
import {
  hasAdditionalRewards,
  getAdditionalRewardIcons,
  getExtraRewardIcons,
  hasNonIonRewards
} from '@ui/utils/marketUtils';
import { multipliers } from '@ui/utils/multipliers';

export type RewardIcon = {
  name: string;
  icon: string;
  text?: string;
  link?: string;
};

type APRCellData = {
  baseAPRFormatted: string;
  effectiveNativeYield: number | undefined;
  showRewardsBadge: boolean;
  showIonBadge: boolean;
  config: Record<string, any> | undefined;
  merklAprFormatted: string | undefined;
  rewardIcons: string[];
  additionalRewards: RewardIcon[];
};

export function useAPRCell({
  type,
  baseAPR,
  asset,
  dropdownSelectedChain,
  selectedPoolId,
  rewards,
  nativeAssetYield,
  underlyingToken,
  cToken
}: APRCellProps): APRCellData {
  const { data: merklApr } = useMerklData();
  const config =
    multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.[type];

  const { data: emissionsData, isLoading: isEmissionsLoading } =
    useMarketEmissions({
      chainId: dropdownSelectedChain as 8453 | 34443,
      cTokenAddresses: cToken ? [cToken] : undefined
    });

  return useMemo(() => {
    const merklAprForOP = merklApr?.find(
      (info) =>
        info.token?.toLowerCase() === underlyingToken?.toLowerCase() &&
        info.type === type
    )?.apr;

    const effectiveNativeYield =
      nativeAssetYield !== undefined
        ? nativeAssetYield * 100
        : config?.underlyingAPR;

    const merklAprFormatted = merklAprForOP?.toLocaleString('en-US', {
      maximumFractionDigits: 2
    });

    const baseAPRPrefix =
      type === 'borrow' && baseAPR > 0 ? '-' : type === 'supply' ? '+' : '';
    const baseAPRFormatted =
      baseAPRPrefix +
      baseAPR.toLocaleString('en-US', { maximumFractionDigits: 2 });

    const marketEmissions = emissionsData?.data.find(
      (market) => market.cTokenAddress.toLowerCase() === cToken?.toLowerCase()
    );

    const hasEmissions =
      marketEmissions &&
      !isEmissionsLoading &&
      ((type === 'supply' && marketEmissions.supplyEmissions > 0) ||
        (type === 'borrow' && marketEmissions.borrowEmissions > 0));
    const showIonBadge = !!hasEmissions;

    return {
      baseAPRFormatted,
      effectiveNativeYield,
      showRewardsBadge:
        hasNonIonRewards(rewards, dropdownSelectedChain) ||
        hasAdditionalRewards(config),
      showIonBadge,
      config,
      merklAprFormatted,
      rewardIcons: getAdditionalRewardIcons(
        config,
        effectiveNativeYield,
        asset
      ),
      additionalRewards: getExtraRewardIcons(config, asset)
    };
  }, [
    type,
    baseAPR,
    asset,
    dropdownSelectedChain,
    rewards,
    nativeAssetYield,
    underlyingToken,
    merklApr,
    config,
    cToken,
    emissionsData,
    isEmissionsLoading
  ]);
}
