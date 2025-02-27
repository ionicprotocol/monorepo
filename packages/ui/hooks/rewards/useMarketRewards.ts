import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

import type { BaseReward } from './useRewardsAggregator';
import type { Hex } from 'viem';

import type { SupportedChains } from '@ionicprotocol/types';

export const useMarketRewards = (
  chainIds: SupportedChains[],
  account?: Hex
) => {
  const { address, getSdk } = useMultiIonic();
  const addressToUse = account || address;

  return useQuery({
    queryKey: ['marketRewards', chainIds, addressToUse],
    queryFn: async () => {
      const rewards: BaseReward[] = [];

      await Promise.all(
        chainIds.map(async (chainId) => {
          const sdk = getSdk(chainId);
          if (!sdk) return;

          const chainRewards = await sdk
            .getAllFlywheelClaimableRewards(addressToUse!)
            .catch(() => {
              console.warn('Error fetching market rewards', { chainId });
              return [];
            });

          chainRewards
            .filter((reward) => reward.amount > 0n)
            .forEach((reward) => {
              rewards.push({
                amount: reward.amount,
                chainId,
                rewardToken: reward.rewardToken
              });
            });
        })
      );

      return rewards;
    },
    enabled: !!addressToUse && chainIds.length > 0
  });
};
