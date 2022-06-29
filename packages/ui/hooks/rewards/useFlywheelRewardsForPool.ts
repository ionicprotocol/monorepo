import LogRocket from 'logrocket';
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
      try {
        // Try with APRs first
        return await fuse.getFlywheelMarketRewardsByPoolWithAPR(poolAddress, {
          from: address,
        });
      } catch (error) {
        LogRocket.captureException(new Error(`Unable to get Rewards with APRs for ${poolAddress}`));
        // Fallback to rewards without APRs
        return fuse.getFlywheelMarketRewardsByPool(poolAddress, {
          from: address,
        });
      }
    },
    { enabled: !!poolAddress, initialData: [] }
  );
};
