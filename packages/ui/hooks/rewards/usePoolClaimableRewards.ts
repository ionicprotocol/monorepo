import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from 'react-query';

import { useMidas } from '@ui/context/MidasContext';

export const usePoolClaimableRewards = ({ poolAddress }: { poolAddress: string }) => {
  const { midasSdk, address } = useMidas();

  return useQuery<FlywheelClaimableRewards[] | undefined>(
    ['usePoolClaimableRewards', poolAddress, address],
    () => midasSdk.getFlywheelClaimableRewardsForPool(poolAddress, address),
    { enabled: !!poolAddress && !!address }
  );
};
