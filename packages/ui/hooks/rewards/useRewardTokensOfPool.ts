import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useRewardTokensOfPool = (
  poolAddress?: string,
  chainId?: number
) => {
  const sdk = useSdk(chainId);

  const { data } = useQuery({
    queryKey: ['useRewardTokensOfPool', sdk?.chainId, poolAddress],

    queryFn: async () => {
      if (poolAddress && sdk) {
        try {
          const rewards = await sdk.getFlywheelMarketRewardsByPool(poolAddress);

          return rewards
            .flatMap((r) => r.rewardsInfo)
            .map((ri) => ri.rewardToken)
            .filter((value, index, self) => self.indexOf(value) === index);
        } catch (e) {
          console.warn(
            `Getting reward tokens of pool error: `,
            { chainId, poolAddress },
            e
          );

          return null;
        }
      } else {
        return null;
      }
    },

    gcTime: Infinity,
    enabled: !!poolAddress && !!sdk,
    placeholderData: [],
    staleTime: Infinity
  });

  return data || [];
};
