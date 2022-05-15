import { useQuery } from 'react-query';
import { useAccount } from 'wagmi';

import { useRari } from '@ui/context/RariContext';

export const useRewardTokensOfPool = (poolAddress?: string) => {
  const {
    fuse,
    currentChain: { id },
  } = useRari();
  const { data: accountData } = useAccount();

  const { data } = useQuery(
    ['useRewardTokensOfPool', id, poolAddress],
    async () => {
      if (!accountData?.address || !poolAddress) return undefined;

      const rewards = await fuse.getFlywheelMarketRewardsByPool(poolAddress, {
        from: accountData.address,
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
