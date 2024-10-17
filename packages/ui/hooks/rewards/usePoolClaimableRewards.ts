import { useQuery } from '@tanstack/react-query';
import { type Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const usePoolClaimableRewards = (
  poolAddress: Address,
  poolChainId: number,
  account?: Address
) => {
  const { address } = useMultiIonic();
  const addressToUse = account || address;
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: ['usePoolClaimableRewards', poolAddress, address, sdk?.chainId],

    queryFn: async () => {
      const rewards = await sdk!.getFlywheelClaimableRewardsForPool(
        poolAddress!,
        addressToUse!
      );

      return rewards.filter((reward) => reward.amount > 0n);
    },

    enabled: !!poolAddress && !!addressToUse && !!sdk,
    staleTime: Infinity
  });
};
