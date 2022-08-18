import LogRocket from 'logrocket';
import { useQuery } from 'react-query';

import { useMidas } from '@ui/context/MidasContext';

export const useFlywheelRewardsForPool = (poolAddress?: string) => {
  const {
    midasSdk,
    currentChain: { id: chainId },
    address,
  } = useMidas();

  return useQuery(
    ['useFlywheelRewardsForPool', chainId, poolAddress],
    async () => {
      if (!poolAddress) return undefined;
      try {
        // Try with APRs first
        return await midasSdk.getFlywheelMarketRewardsByPoolWithAPR(poolAddress, {
          from: address,
        });
      } catch (error) {
        LogRocket.captureException(new Error(`Unable to get Rewards with APRs for ${poolAddress}`));
        // Fallback to rewards without APRs
        return midasSdk.getFlywheelMarketRewardsByPool(poolAddress, {
          from: address,
        });
      }
    },
    { enabled: !!poolAddress, initialData: [] }
  );
};
