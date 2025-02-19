import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatUnits } from 'viem';

import { REWARDS_TO_SYMBOL } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useVeIONContext } from '@ui/context/VeIonContext';

import { useMarketRewards } from './useMarketRewards';
import { useStakingRewards } from './useStakingRewards';

import type { Hex } from 'viem';

import type { SupportedChains } from '@ionicprotocol/types';

export interface BaseReward {
  amount: bigint;
  chainId: SupportedChains;
  rewardToken: Hex;
}

export interface FormattedReward {
  id: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  network: string;
  section: 'Locked LP Emissions' | 'Market Emissions' | 'Protocol Bribes';
  chainId: number;
  rewardToken: Hex;
}

export const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 8453:
      return 'Base';
    case 34443:
      return 'Mode';
    case 10:
      return 'Optimism';
    default:
      return 'Unknown';
  }
};

export const useRewardsAggregator = (chainIds: number[]) => {
  const { getSdk } = useMultiIonic();
  const { currentChain } = useVeIONContext();
  const queryClient = useQueryClient();

  const { data: marketRewards, isLoading: isLoadingMarket } =
    useMarketRewards(chainIds);
  const {
    data: stakingRewards,
    isLoading: isLoadingStaking,
    claimRewards: claimStakingRewards
  } = useStakingRewards(currentChain);

  const { data: formattedRewards, isLoading: isProcessing } = useQuery({
    queryKey: ['formattedRewards', marketRewards, stakingRewards],
    queryFn: async () => {
      const rewards: FormattedReward[] = [];

      if (marketRewards) {
        marketRewards.forEach((reward) => {
          const tokenSymbol =
            REWARDS_TO_SYMBOL[reward.chainId][reward.rewardToken];
          rewards.push({
            id: `market-${reward.chainId}-${reward.rewardToken}`,
            token: tokenSymbol.toLowerCase(),
            tokenSymbol,
            amount: formatUnits(reward.amount, 18),
            network: getNetworkName(reward.chainId),
            section: 'Market Emissions',
            chainId: reward.chainId,
            rewardToken: reward.rewardToken
          });
        });
      }

      if (stakingRewards) {
        rewards.push({
          id: `staking-${stakingRewards.chainId}-${stakingRewards.rewardToken}`,
          token: 'aero',
          tokenSymbol: 'AERO',
          amount: formatUnits(stakingRewards.amount, 18),
          network: getNetworkName(stakingRewards.chainId),
          section: 'Locked LP Emissions',
          chainId: stakingRewards.chainId,
          rewardToken: stakingRewards.rewardToken
        });
      }

      return rewards;
    },
    enabled: !!marketRewards || !!stakingRewards
  });

  const claimRewards = async (selectedIds?: string[]) => {
    if (!formattedRewards) return;

    const rewardsToProcess = selectedIds
      ? formattedRewards.filter((r) => selectedIds.includes(r.id))
      : formattedRewards;

    const rewardsByChain = rewardsToProcess.reduce(
      (acc, reward) => {
        if (!acc[reward.chainId]) {
          acc[reward.chainId] = {
            market: [] as Hex[],
            staking: [] as Hex[]
          };
        }

        if (reward.section === 'Market Emissions') {
          acc[reward.chainId].market.push(reward.rewardToken);
        } else if (reward.section === 'Locked LP Emissions') {
          acc[reward.chainId].staking.push(reward.rewardToken);
        }

        return acc;
      },
      {} as Record<number, { market: Hex[]; staking: Hex[] }>
    );

    for (const [chainId, { market, staking }] of Object.entries(
      rewardsByChain
    )) {
      const sdk = getSdk(Number(chainId));
      if (!sdk) continue;

      try {
        // Claim market rewards
        if (market.length > 0) {
          if (market.length === 1) {
            await sdk.claimRewardsForRewardToken(market[0]);
          } else {
            await sdk.claimAllRewards();
          }
          await queryClient.invalidateQueries({ queryKey: ['marketRewards'] });
        }

        // Claim staking rewards
        if (staking.length > 0) {
          await claimStakingRewards();
          await queryClient.invalidateQueries({ queryKey: ['stakingRewards'] });
        }

        await queryClient.invalidateQueries({ queryKey: ['formattedRewards'] });
      } catch (error) {
        console.error(`Error claiming rewards for chain ${chainId}:`, error);
      }
    }
  };

  return {
    rewards: formattedRewards ?? [],
    isLoading: isLoadingMarket || isLoadingStaking || isProcessing,
    claimRewards
  };
};
