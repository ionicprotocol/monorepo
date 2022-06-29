import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const useRewardTokensOfPool = (poolAddress?: string) => {
  const {
    fuse,
    currentChain: { id },
    address,
  } = useRari();

  const { data } = useQuery(
    ['useRewardTokensOfPool', id, poolAddress],
    async () => {
      if (!poolAddress) return undefined;

      const rewards = await fuse.getFlywheelMarketRewardsByPool(poolAddress, {
        from: address,
      });

      return rewards
        .flatMap((r) => r.rewardsInfo)
        .map((ri) => ri.rewardToken)
        .filter((value, index, self) => self.indexOf(value) === index);
    },
    { enabled: !!poolAddress, placeholderData: [] }
  );

  return data || [];
};
