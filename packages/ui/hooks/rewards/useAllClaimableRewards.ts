import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from 'react-query';

import { useMidas } from '@ui/context/MidasContext';

export const useAllClaimableRewards = () => {
  const { midasSdk, address } = useMidas();

  return useQuery<FlywheelClaimableRewards[] | undefined>(
    ['useAllClaimableRewards', midasSdk.chainId, address],
    () => midasSdk.getFlywheelClaimableRewards(address),
    { enabled: !!address }
  );
};
