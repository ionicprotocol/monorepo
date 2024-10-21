import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

import type { Address } from 'viem';

import type { SupportedChains } from '@ionicprotocol/types';

interface RewardsType {
  amount: bigint;
  rewardToken: string;
}

export const useMarketAndFlywheelClaimableRewards = (
  chainId: SupportedChains,
  markets: Address[],
  flywheels: Address[],
  account?: Address
) => {
  const { address, getSdk } = useMultiIonic();
  const addressToUse = account || address;
  return useQuery({
    queryKey: [
      'useMarketAndFlywheelClaimableRewards',
      chainId,
      markets,
      flywheels,
      address
    ],

    queryFn: async () => {
      const allRewards: RewardsType[] = [];

      const sdk = getSdk(chainId);

      if (sdk) {
        const rewards = await sdk
          .getRewardsForMarketsAndFlywheels(addressToUse!, markets, flywheels)
          .catch(() => {
            console.warn('Getting all claimable reward error', {
              chainId
            });

            return [];
          });
        rewards.map((reward) => {
          if (reward.amount > 0n) {
            allRewards.push({
              amount: reward.amount,
              rewardToken: reward.rewardToken
            });
          }
        });
      }

      return allRewards;
    },

    enabled: !!addressToUse && markets.length > 0 && flywheels.length > 0,
    staleTime: Infinity
  });
};
