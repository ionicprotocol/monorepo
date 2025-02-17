import { useQuery } from '@tanstack/react-query';
import { formatUnits, type Address } from 'viem';

import { REWARDS_TO_SYMBOL } from '@ui/constants';
import { useMultiIonic } from '@ui/context/MultiIonicContext';

import { useAllClaimableRewards } from '../rewards/useAllClaimableRewards';

import type { SupportedChains } from '@ionicprotocol/types';

export interface CategoryReward {
  id: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  network: string;
  section: 'Locked LP Emissions' | 'Market Emissions' | 'Protocol Bribes';
  chainId: number;
  rewardToken: Address;
}

// Helper to determine reward section
const getRewardSection = (rewardToken: string): CategoryReward['section'] => {
  const token = rewardToken.toLowerCase();
  console.log('token', token);
  if (token.includes('market')) return 'Market Emissions';
  if (token.includes('lp')) return 'Locked LP Emissions';
  return 'Protocol Bribes';
};

// Helper to get network name
const getNetworkName = (chainId: number): string => {
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

export function useVeionUniversalClaim(chainIds: number[]) {
  const { data: rawRewards, isLoading: isLoadingRewards } =
    useAllClaimableRewards(chainIds);
  const { getSdk } = useMultiIonic();
  console.log('rawRewards', rawRewards);

  const { data: categorizedRewards, isLoading: isProcessingRewards } = useQuery(
    {
      queryKey: ['categorizedRewards', rawRewards],
      queryFn: async () => {
        if (!rawRewards) return [];

        return rawRewards.map((reward): CategoryReward => {
          const tokenSymbol =
            REWARDS_TO_SYMBOL[reward.chainId][
              reward.rewardToken as keyof (typeof REWARDS_TO_SYMBOL)[SupportedChains]
            ];

          return {
            id: `${reward.chainId}-${reward.rewardToken}`,
            token: tokenSymbol.toLowerCase(),
            tokenSymbol,
            amount: formatUnits(reward.amount, 18),
            network: getNetworkName(reward.chainId),
            section: 'Market Emissions',
            chainId: reward.chainId,
            rewardToken: reward.rewardToken as Address
          };
        });
      },
      enabled: !!rawRewards
    }
  );

  const claimRewards = async (selectedIds?: string[]) => {
    if (!rawRewards) return;

    const rewardsToProcess = selectedIds
      ? categorizedRewards?.filter((r) => selectedIds.includes(r.id))
      : categorizedRewards;

    if (!rewardsToProcess) return;

    // Group rewards by chain for efficient claiming
    const rewardsByChain = rewardsToProcess.reduce(
      (acc, reward) => {
        if (!acc[reward.chainId]) {
          acc[reward.chainId] = [];
        }
        acc[reward.chainId].push(reward.rewardToken);
        return acc;
      },
      {} as Record<number, Address[]>
    );

    // Process claims chain by chain
    for (const [chainId, rewardTokens] of Object.entries(rewardsByChain)) {
      const sdk = getSdk(Number(chainId));
      if (!sdk) continue;

      if (rewardTokens.length === 1) {
        // Single reward token - use specific claim function
        await sdk.claimRewardsForRewardToken(rewardTokens[0]);
      } else {
        // Multiple reward tokens - use claimAllRewards
        await sdk.claimAllRewards();
      }
    }
  };

  // Get rewards grouped by section
  const rewardsBySection =
    categorizedRewards?.reduce(
      (acc, reward) => {
        if (!acc[reward.section]) {
          acc[reward.section] = [];
        }
        acc[reward.section].push(reward);
        return acc;
      },
      {} as Record<CategoryReward['section'], CategoryReward[]>
    ) ?? {};

  return {
    rewards: categorizedRewards ?? [],
    rewardsBySection,
    isLoading: isLoadingRewards || isProcessingRewards,
    claimRewards
  };
}
