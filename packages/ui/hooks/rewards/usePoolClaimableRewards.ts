import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const usePoolClaimableRewards = ({ poolAddress }: { poolAddress: string }) => {
  const { fuse, address } = useRari();

  return useQuery<FlywheelClaimableRewards[] | undefined>(
    ['usePoolClaimableRewards', poolAddress, address],
    () =>
      fuse.getFlywheelClaimableRewardsForPool(poolAddress, address, {
        from: address,
      }),
    { enabled: !!poolAddress && !!address }
  );
};
