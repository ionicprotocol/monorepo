import type { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useAllClaimableRewards = () => {
  const { currentSdk, address } = useMultiMidas();

  return useQuery<Pick<FlywheelClaimableRewards, 'amount' | 'rewardToken'>[] | null | undefined>(
    ['useAllClaimableRewards', currentSdk?.chainId, address],
    async () => {
      if (currentSdk && address) {
        return await currentSdk.getAllFlywheelClaimableRewards(address).catch((e) => {
          console.warn(
            `Getting all claimable rewards error: `,
            { address, chainId: currentSdk.chainId },
            e
          );

          return null;
        });
      } else {
        return null;
      }
    },
    { cacheTime: Infinity, enabled: !!address && !!currentSdk, staleTime: Infinity }
  );
};
