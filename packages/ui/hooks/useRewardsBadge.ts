// useRewardsBadge.ts
import { useMemo } from 'react';

import { REWARDS_TO_SYMBOL } from '@ui/constants/index';
import { multipliers } from '@ui/utils/multipliers';

import type { FlywheelReward } from '@ionicprotocol/types';

const EXCLUDED_REWARD_KEYS = ['ionAPR', 'turtle', 'flywheel'] as const;

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => Boolean(value))
    .map(([key]) => key);

  return truthyKeys.some((key) => !EXCLUDED_REWARD_KEYS.includes(key as any));
};

export function useRewardsBadge(
  chainId: number,
  poolId: string,
  asset: string,
  type: 'borrow' | 'supply',
  rewards?: FlywheelReward[]
): boolean {
  return useMemo(() => {
    const config = multipliers[chainId]?.[poolId]?.[asset]?.[type];

    return hasNonIonRewards(rewards, chainId) || hasAdditionalRewards(config);
  }, [chainId, poolId, asset, type, rewards]);
}
