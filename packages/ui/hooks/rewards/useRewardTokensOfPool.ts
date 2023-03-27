import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useRewardTokensOfPool = (poolAddress?: string, chainId?: number) => {
  const sdk = useSdk(chainId);

  const { data } = useQuery(
    ['useRewardTokensOfPool', sdk?.chainId, poolAddress],
    async () => {
      if (poolAddress && sdk) {
        const rewards = await sdk.getFlywheelMarketRewardsByPool(poolAddress);

        return rewards
          .flatMap((r) => r.rewardsInfo)
          .map((ri) => ri.rewardToken)
          .filter((value, index, self) => self.indexOf(value) === index);
      } else {
        return null;
      }
    },
    {
      cacheTime: Infinity,
      enabled: !!poolAddress && !!sdk,
      placeholderData: [],
      staleTime: Infinity,
    }
  );

  return data || [];
};
