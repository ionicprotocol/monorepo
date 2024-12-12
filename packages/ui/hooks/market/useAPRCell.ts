import { useMemo } from 'react';

import type { APRCellProps } from '@ui/app/_components/markets/APRCell';
import { REWARDS_TO_SYMBOL } from '@ui/constants/index';
import { useMerklData } from '@ui/hooks/useMerklData';
import { multipliers } from '@ui/utils/multipliers';

import type { FlywheelReward } from '@ionicprotocol/types';

const EXCLUDED_REWARD_KEYS = ['ionAPR', 'turtle', 'flywheel'] as const;

type RewardIcon = {
  name: string;
  icon: string;
  text?: string;
  link?: string;
};

type APRCellData = {
  totalAPR: string;
  baseAPRFormatted: string;
  effectiveNativeYield: number | undefined;
  showRewardsBadge: boolean;
  showIonBadge: boolean;
  config: Record<string, any> | undefined;
  merklAprFormatted: string | undefined;
  rewardIcons: string[];
  additionalRewards: RewardIcon[];
};

const hasNonIonRewards = (
  rewards: FlywheelReward[] | undefined,
  chainId: number
): boolean => {
  return Boolean(
    rewards?.some(
      (r) =>
        r?.apy && r.apy > 0 && REWARDS_TO_SYMBOL[chainId]?.[r?.token] !== 'ION'
    )
  );
};

const hasAdditionalRewards = (
  config: Record<string, any> | undefined
): boolean => {
  if (!config) return false;

  const truthyKeys = Object.entries(config)
    .filter(([_, value]) => Boolean(value))
    .map(([key]) => key);

  return truthyKeys.some((key) => !EXCLUDED_REWARD_KEYS.includes(key as any));
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
      (a) => Object.keys(a)[0].toLowerCase() === underlyingToken.toLowerCase()
    )?.[underlyingToken];

    const effectiveNativeYield =
      nativeAssetYield !== undefined
        ? nativeAssetYield * 100
        : config?.underlyingAPR;

    const showRewardsBadge =
      hasNonIonRewards(rewards, dropdownSelectedChain) ||
      hasAdditionalRewards(config);

    let total = type === 'borrow' ? -(baseAPR ?? 0) : baseAPR ?? 0;

    const flywheelRewardsAPR =
      rewards?.reduce((acc, reward) => {
        return acc + (reward.apy || 0);
      }, 0) ?? 0;
    total += flywheelRewardsAPR;

    if (effectiveNativeYield) {
      total += effectiveNativeYield;
    }

    if (config?.op && merklAprForOP) {
      total += merklAprForOP;
    }

    const merklAprFormatted = merklAprForOP?.toLocaleString('en-US', {
      maximumFractionDigits: 2
    });

    const prefix = type === 'supply' || total > 0 ? '+' : '';
    const totalAPR =
      prefix + total.toLocaleString('en-US', { maximumFractionDigits: 2 });

    const baseAPRPrefix =
      type === 'borrow' && baseAPR > 0 ? '-' : type === 'supply' ? '+' : '';
    const baseAPRFormatted =
      baseAPRPrefix +
      baseAPR.toLocaleString('en-US', { maximumFractionDigits: 2 });

    const rewardIcons: string[] = [];
    if (effectiveNativeYield !== undefined) {
      rewardIcons.push(asset.toLowerCase());
    }
    if (config?.lsk) rewardIcons.push('lsk');
    if (config?.op) rewardIcons.push('op');
    if (config?.etherfi) rewardIcons.push('etherfi');
    if (config?.kelp) rewardIcons.push('kelp');
    if (config?.eigenlayer) rewardIcons.push('eigen');
    if (config?.spice) rewardIcons.push('spice');

    const additionalRewards: RewardIcon[] = [];

    if (config?.turtle && asset === 'STONE') {
      additionalRewards.push({
        name: 'stone',
        icon: '/img/symbols/32/color/stone.png',
        text: '+ Stone Turtle Points'
      });
    }

    if (config?.etherfi) {
      additionalRewards.push({
        name: 'etherfi',
        icon: '/images/etherfi.png',
        text: `+ ${config.etherfi}x ether.fi Points`
      });
    }

    if (config?.kelp) {
      additionalRewards.push(
        {
          name: 'kelpmiles',
          icon: '/images/kelpmiles.png',
          text: `+ ${config.kelp}x Kelp Miles`
        },
        {
          name: 'turtle-kelp',
          icon: '/images/turtle-kelp.png',
          text: '+ Turtle Kelp Points'
        }
      );
    }

    if (config?.eigenlayer) {
      additionalRewards.push({
        name: 'eigen',
        icon: '/images/eigen.png',
        text: '+ EigenLayer Points'
      });
    }

    if (config?.spice) {
      additionalRewards.push({
        name: 'spice',
        icon: '/img/symbols/32/color/bob.png',
        text: '+ Spice Points'
      });
    }

    return {
      totalAPR,
      baseAPRFormatted,
      effectiveNativeYield,
      showRewardsBadge,
      showIonBadge: Boolean(config?.ionAPR),
      config,
      merklAprFormatted,
      rewardIcons,
      additionalRewards
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
