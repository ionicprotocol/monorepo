import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

import type { Address } from 'viem';

import type { SupportedChains } from '@ionicprotocol/types';

interface AllRewardsType {
  amount: bigint;
  chainId: SupportedChains;
  rewardToken: string;
}

export const useAllClaimableRewards = (
  chainIds: SupportedChains[],
  account?: Address
) => {
  const { address, getSdk } = useMultiIonic();
  const addressToUse = account || address;
  return useQuery({
    queryKey: ['useAllClaimableRewards', chainIds, addressToUse],

    queryFn: async () => {
      const allRewards: AllRewardsType[] = [];

      await Promise.all(
        chainIds.map(async (chainId) => {
          const sdk = getSdk(chainId);

          if (sdk) {
            const rewards = await sdk
              .getAllFlywheelClaimableRewards(addressToUse!)
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
                  chainId,
                  rewardToken: reward.rewardToken
                });
              }
            });
          }
        })
      );

      return allRewards;
    },

    enabled: !!addressToUse || chainIds.length > 0,
    staleTime: Infinity
  });
};
