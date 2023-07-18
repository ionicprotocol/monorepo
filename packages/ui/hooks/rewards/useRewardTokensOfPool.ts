import { useQuery } from '@tanstack/react-query';

import { useSdk } from '@ui/hooks/ionic/useSdk';

export const useRewardTokensOfPool = (poolAddress?: string, chainId?: number) => {
  const sdk = useSdk(chainId);

  return useQuery(
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
          console.warn(`Getting reward tokens of pool error: `, { chainId, poolAddress }, e);

          return null;
        }
      } else {
        return null;
      }
    },
    {
      enabled: !!poolAddress && !!sdk,
      placeholderData: []
    }
  );
};
