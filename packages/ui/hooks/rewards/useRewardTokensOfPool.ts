import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useRewardTokensOfPool = (poolAddress?: string, poolChainid?: number) => {
  const { getSdk } = useMultiMidas();
  const sdk = useMemo(() => {
    if (poolChainid) return getSdk(poolChainid);
  }, [getSdk, poolChainid]);

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
