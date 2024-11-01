import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';

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
  rewardToken: string;
}

export function useVeionUniversalClaim(chainIds: number[]) {
  const { data: rawRewards, isLoading } = useAllClaimableRewards(chainIds);
  const { getSdk } = useMultiIonic();

  // Transform raw rewards into categorized rewards
  const categorizedRewards = useQuery({
    queryKey: ['categorizedRewards', rawRewards],
    queryFn: async () => {
      if (!rawRewards) return [];

      return rawRewards.map((reward): CategoryReward => {
        const tokenSymbol =
          REWARDS_TO_SYMBOL[reward.chainId][
            reward.rewardToken as keyof (typeof REWARDS_TO_SYMBOL)[SupportedChains]
          ];

        const section = reward.rewardToken.toLowerCase().includes('market')
          ? 'Market Emissions'
          : reward.rewardToken.toLowerCase().includes('lp')
            ? 'Locked LP Emissions'
            : 'Protocol Bribes';

        return {
          id: `${reward.chainId}-${reward.rewardToken}`,
          token: tokenSymbol.toLowerCase(),
          tokenSymbol: tokenSymbol,
          amount: formatUnits(reward.amount, 18),
          network:
            reward.chainId === 8453
              ? 'Base'
              : reward.chainId === 34443
                ? 'Mode'
                : 'Optimism',
          section,
          chainId: reward.chainId,
          rewardToken: reward.rewardToken
        };
      });
    },
    enabled: !!rawRewards
  });

  // Function to claim selected rewards
  const claimSelectedRewards = async (selectedIds: string[]) => {
    if (!rawRewards) return;

    // Group selected rewards by chain
    const rewardsByChain = selectedIds.reduce(
      (acc, id) => {
        const reward = categorizedRewards.data?.find((r) => r.id === id);
        if (reward) {
          if (!acc[reward.chainId]) {
            acc[reward.chainId] = [];
          }
          acc[reward.chainId].push(reward.rewardToken);
        }
        return acc;
      },
      {} as Record<number, string[]>
    );

    // Claim rewards chain by chain
    for (const [chainId, rewards] of Object.entries(rewardsByChain)) {
      const sdk = getSdk(Number(chainId));
      if (sdk) {
        try {
          // eslint-disable-next-line no-console
          console.log('rewards', rewards);
          //   await sdk.claimRewards(rewards);
        } catch (error) {
          console.error(`Error claiming rewards on chain ${chainId}:`, error);
          throw error;
        }
      }
    }
  };

  return {
    rewards: categorizedRewards.data ?? [],
    isLoading: isLoading || categorizedRewards.isLoading,
    claimSelectedRewards
  };
}
