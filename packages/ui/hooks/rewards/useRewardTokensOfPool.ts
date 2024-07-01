import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useRewardTokensOfPool = (
  poolAddress?: Address,
  chainId?: number
) => {
  const sdk = useSdk(chainId);

  const { data } = useQuery(
    ['useRewardTokensOfPool', sdk?.chainId, poolAddress],
    async () => {
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
    {
      cacheTime: Infinity,
      enabled: !!poolAddress && !!sdk,
      placeholderData: [],
      staleTime: Infinity
    }
  );

  return data || [];
};
