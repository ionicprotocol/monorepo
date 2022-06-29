import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const useFlywheelRewardsForPool = (poolAddress?: string) => {
  const {
    fuse,
    currentChain: { id: chainId },
    address,
  } = useRari();

  return useQuery(
    ['useFlywheelRewardsForPool', chainId, poolAddress],
    async () => {
      if (!poolAddress) return undefined;
      return fuse.getFlywheelMarketRewardsByPool(poolAddress, {
        from: address,
      });
    },
    { enabled: !!poolAddress, initialData: [] }
  );
};
