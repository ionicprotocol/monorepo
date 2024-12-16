import { useMemo } from 'react';

import type { APRCellProps } from '@ui/app/_components/markets/APRCell';
import { useMerklData } from '@ui/hooks/useMerklData';
import { multipliers } from '@ui/utils/multipliers';

import {
  hasAdditionalRewards,
  getAdditionalRewardIcons,
  getExtraRewardIcons,
  hasNonIonRewards
} from '@ui/utils/marketUtils';

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
  underlyingToken
}: APRCellProps): APRCellData {
  const { data: merklApr } = useMerklData();
  const config =
    multipliers[dropdownSelectedChain]?.[selectedPoolId]?.[asset]?.[type];

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

    return {
      baseAPRFormatted,
      effectiveNativeYield,
      showRewardsBadge:
        hasNonIonRewards(rewards, dropdownSelectedChain) ||
        hasAdditionalRewards(config),
      showIonBadge: Boolean(config?.ionAPR),
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
    config
  ]);
}
