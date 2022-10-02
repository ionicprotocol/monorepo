import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useRewardTokensOfPool = (poolAddress?: string, poolChainid?: number) => {
  const { data: sdk } = useSdk(poolChainid);

  const { data } = useQuery(
    ['useRewardTokensOfPool', sdk?.chainId, poolAddress],
    async () => {
      if (poolAddress && sdk) {
        const rewards = await sdk.getFlywheelMarketRewardsByPool(poolAddress);

        return rewards
          .flatMap((r) => r.rewardsInfo)
          .map((ri) => ri.rewardToken)
          .filter((value, index, self) => self.indexOf(value) === index);
      }
    },
    { enabled: !!poolAddress && !!sdk, placeholderData: [] }
  );

  return data || [];
};
