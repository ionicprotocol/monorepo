import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const useAllClaimableRewards = () => {
  const { fuse, address } = useRari();

  return useQuery<FlywheelClaimableRewards[] | undefined>(
    ['useAllClaimableRewards', fuse.chainId, address],
    () =>
      fuse.getFlywheelClaimableRewards(address, {
        from: address,
      }),
    { enabled: !!address }
  );
};
