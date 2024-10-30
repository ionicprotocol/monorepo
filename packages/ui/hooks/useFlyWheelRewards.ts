// useFlywheelRewards.ts
import { useMemo } from 'react';

import { type Address } from 'viem';

import { FLYWHEEL_TYPE_MAP } from '@ui/constants/index';
import { useAssetClaimableRewards } from '@ui/hooks/rewards/useAssetClaimableRewards';

import { type FlywheelClaimableRewards } from '@ionicprotocol/sdk';

interface UseFlywheelRewardsReturn {
  filteredRewards: FlywheelClaimableRewards[];
  totalRewards: bigint;
  combinedRewards: FlywheelClaimableRewards[];
  hasActiveRewards: boolean;
}

const processFlywheelRewards = (
  rewardsData: FlywheelClaimableRewards[] | null | undefined,
  chainId: number,
  type: 'borrow' | 'supply'
): UseFlywheelRewardsReturn => {
  const filtered =
    rewardsData?.filter((reward) =>
      FLYWHEEL_TYPE_MAP[chainId][type]
        .map((f) => f.toLowerCase())
        .includes(reward.flywheel?.toLowerCase() ?? '')
    ) ?? [];

  const total = filtered.reduce((acc, reward) => acc + reward.amount, 0n);

  const combined = filtered.reduce((acc, reward) => {
    const el = acc.find((a) => a.rewardToken === reward.rewardToken);
    if (el) {
      el.amount += reward.amount;
    } else {
      acc.push({ rewardToken: reward.rewardToken, amount: reward.amount });
    }
    return acc;
  }, [] as FlywheelClaimableRewards[]);

  return {
    filteredRewards: filtered,
    totalRewards: total,
    combinedRewards: combined,
    hasActiveRewards: total > 0n || combined.length > 0
  };
};

export function useFlywheelRewards(
  chainId: number,
  cToken: Address,
  pool: Address,
  type: 'borrow' | 'supply'
): UseFlywheelRewardsReturn {
  const { data: rewardsData } = useAssetClaimableRewards(cToken, pool, chainId);

  return useMemo(
    () => processFlywheelRewards(rewardsData, chainId, type),
    [rewardsData, chainId, type]
  );
}
