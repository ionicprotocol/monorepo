import { useQuery } from '@tanstack/react-query';
import LogRocket from 'logrocket';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useFlywheelRewardsForPool = (poolAddress?: string) => {
  const { currentSdk } = useMultiMidas();

  return useQuery(
    ['useFlywheelRewardsForPool', currentSdk?.chainId || '', poolAddress || ''],
    async () => {
      if (!poolAddress || !currentSdk) return undefined;

      try {
        // Try with APRs first
        return await currentSdk.getFlywheelMarketRewardsByPoolWithAPR(poolAddress);
      } catch (error) {
        LogRocket.captureException(new Error(`Unable to get Rewards with APRs for ${poolAddress}`));
        // Fallback to rewards without APRs
        return currentSdk.getFlywheelMarketRewardsByPool(poolAddress);
      }
    },
    { enabled: !!poolAddress && !!currentSdk, initialData: [] }
  );
};
