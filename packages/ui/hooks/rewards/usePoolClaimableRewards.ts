import type { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const usePoolClaimableRewards = (poolAddress: string, poolChainId?: number) => {
  const { address } = useMultiMidas();
  const sdk = useSdk(poolChainId);

  return useQuery<FlywheelClaimableRewards[] | null | undefined>(
    ['usePoolClaimableRewards', poolAddress, address, sdk?.chainId],
    async () => {
      if (sdk && address && poolChainId) {
        return await sdk.getFlywheelClaimableRewardsForPool(poolAddress, address);
      }

      return null;
    },
    {
      cacheTime: Infinity,
      enabled: !!poolAddress && !!address && !!sdk,
      staleTime: Infinity,
    }
  );
};
