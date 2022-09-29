import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useRewardTokensOfPool = (poolAddress?: string) => {
  const { currentSdk, currentChain } = useMultiMidas();

  const { data } = useQuery(
    ['useRewardTokensOfPool', currentChain?.id, poolAddress],
    async () => {
      if (!poolAddress || !currentSdk) return undefined;

      const rewards = await currentSdk.getFlywheelMarketRewardsByPool(poolAddress);

      return rewards
        .flatMap((r) => r.rewardsInfo)
        .map((ri) => ri.rewardToken)
        .filter((value, index, self) => self.indexOf(value) === index);
    },
    { enabled: !!poolAddress && !!currentSdk, placeholderData: [] }
  );

  return data || [];
};
