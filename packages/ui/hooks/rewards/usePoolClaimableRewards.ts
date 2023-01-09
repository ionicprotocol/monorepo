import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const usePoolClaimableRewards = ({ poolAddress }: { poolAddress: string }) => {
  const { currentSdk, address } = useMultiMidas();

  return useQuery<FlywheelClaimableRewards[] | null | undefined>(
    ['usePoolClaimableRewards', poolAddress, address, currentSdk?.chainId],
    () => {
      if (currentSdk && address) {
        return currentSdk.getFlywheelClaimableRewardsForPool(poolAddress, address);
      }

      return null;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolAddress && !!address && !!currentSdk,
    }
  );
};
