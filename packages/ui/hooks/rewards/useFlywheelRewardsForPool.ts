import { useQuery } from '@tanstack/react-query';
import LogRocket from 'logrocket';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useFlywheelRewardsForPool = (poolAddress?: string, poolChainId?: number) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    ['useFlywheelRewardsForPool', sdk?.chainId, poolAddress],
    async () => {
      if (poolAddress && sdk) {
        try {
          // Try with APRs first
          return await sdk.getFlywheelMarketRewardsByPoolWithAPR(poolAddress);
        } catch (error) {
          LogRocket.captureException(
            new Error(`Unable to get Rewards with APRs for ${poolAddress}`)
          );
          // Fallback to rewards without APRs
          return sdk.getFlywheelMarketRewardsByPool(poolAddress);
        }
      }
    },
    { enabled: !!poolAddress && !!sdk, initialData: [] }
  );
};
