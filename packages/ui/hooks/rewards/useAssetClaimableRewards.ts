import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from 'react-query';

import { useRari } from '@ui/context/RariContext';

export const useAssetClaimableRewards = ({
  poolAddress,
  assetAddress,
}: {
  poolAddress: string;
  assetAddress: string;
}) => {
  const { midasSdk, address } = useRari();

  return useQuery<FlywheelClaimableRewards[] | undefined>(
    ['useAssetClaimableRewards', poolAddress, assetAddress, address],
    () =>
      midasSdk.getFlywheelClaimableRewardsForAsset(poolAddress, assetAddress, address, {
        from: address,
      }),
    { enabled: !!poolAddress && !!address }
  );
};
