import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const useAllClaimableRewards = () => {
  const { midasSdk, address } = useRari();

  return useQuery<FlywheelClaimableRewards[] | undefined>(
    ['useAllClaimableRewards', midasSdk.chainId, address],
    () =>
      midasSdk.getFlywheelClaimableRewards(address, {
        from: address,
      }),
    { enabled: !!address }
  );
};
