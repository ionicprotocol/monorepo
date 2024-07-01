import type { FlywheelClaimableRewards } from '@ionicprotocol/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const usePoolClaimableRewards = (
  poolAddress: string,
  poolChainId?: number
) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['usePoolClaimableRewards', poolAddress, address, sdk?.chainId],

    queryFn: async () => {
      if (sdk && poolAddress && address) {
        try {
          const rewards = await sdk.getFlywheelClaimableRewardsForPool(
            poolAddress,
            address
          );

          return rewards.filter((reward) => reward.amount.gt(0));
        } catch (e) {
          console.warn(
            'Getting pool claimable rewards error: ',
            {
              address,
              poolAddress,
              poolChainId
            },
            e
          );

          return null;
        }
      }

      return null;
    },

    gcTime: Infinity,
    enabled: !!poolAddress && !!address && !!sdk,
    staleTime: Infinity
  });
};
