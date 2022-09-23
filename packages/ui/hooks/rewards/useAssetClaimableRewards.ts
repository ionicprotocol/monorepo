import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';

import { useMidas } from '@ui/context/MidasContext';

export const useAssetClaimableRewards = ({
  poolAddress,
  assetAddress,
}: {
  poolAddress: string;
  assetAddress: string;
}) => {
  const { midasSdk, address } = useMidas();

  return useQuery<FlywheelClaimableRewards[] | undefined>(
    ['useAssetClaimableRewards', poolAddress, assetAddress, address],
    () => midasSdk.getFlywheelClaimableRewardsForAsset(poolAddress, assetAddress, address),
    { enabled: !!poolAddress && !!address }
  );
};

export const useAssetsClaimableRewards = ({
  poolAddress,
  assetsAddress,
}: {
  poolAddress: string;
  assetsAddress: string[];
}) => {
  const { midasSdk, address } = useMidas();

  return useQuery<{ [key: string]: FlywheelClaimableRewards[] } | undefined>(
    ['useAssetClaimableRewards', poolAddress, assetsAddress, address],
    async () => {
      const res: { [key: string]: FlywheelClaimableRewards[] } = {};

      const allRewards = await Promise.all(
        assetsAddress.map((assetAddress) =>
          midasSdk.getFlywheelClaimableRewardsForAsset(poolAddress, assetAddress, address)
        )
      );

      allRewards.map((reward) => {
        if (reward.length !== 0) {
          res[reward[0].rewards[0].market] = reward;
        }
      });

      return res;
    },
    { enabled: !!poolAddress && !!address }
  );
};
