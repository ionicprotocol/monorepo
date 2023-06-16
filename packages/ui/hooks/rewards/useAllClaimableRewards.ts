import type { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useAllClaimableRewards = () => {
  const { currentSdk, address } = useMultiMidas();

  return useQuery<FlywheelClaimableRewards[] | null | undefined>(
    ['useAllClaimableRewards', currentSdk?.chainId, address],
    () => {
      if (currentSdk && address) {
        return currentSdk.getAllFlywheelClaimableRewards();
      } else {
        return null;
      }
    },
    { cacheTime: Infinity, enabled: !!address && !!currentSdk, staleTime: Infinity }
  );
};
