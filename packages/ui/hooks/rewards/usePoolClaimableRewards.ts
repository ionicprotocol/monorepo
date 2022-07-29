import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const usePoolClaimableRewards = ({ poolAddress }: { poolAddress: string }) => {
  const { midasSdk, address } = useRari();

  return useQuery<FlywheelClaimableRewards[] | undefined>(
    ['usePoolClaimableRewards', poolAddress, address],
    () =>
      midasSdk.getFlywheelClaimableRewardsForPool(poolAddress, address, {
        from: address,
      }),
    { enabled: !!poolAddress && !!address }
  );
};
