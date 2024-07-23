import type { SupportedChains } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';

interface AllRewardsType {
  amount: bigint;
  chainId: SupportedChains;
  rewardToken: string;
}

export const useAllClaimableRewards = (chainIds: SupportedChains[]) => {
  const { address, getSdk } = useMultiIonic();

  return useQuery({
    queryKey: ['useAllClaimableRewards', chainIds, address],

    queryFn: async () => {
      if (chainIds.length > 0 && address) {
        const allRewards: AllRewardsType[] = [];

        await Promise.all(
          chainIds.map(async (chainId) => {
            const sdk = getSdk(chainId);

            if (sdk) {
              const rewards = await sdk
                .getAllFlywheelClaimableRewards(address)
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
      }

      return null;
    },

    gcTime: Infinity,
    enabled: !!address || chainIds.length > 0,
    staleTime: Infinity
  });
};
