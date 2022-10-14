import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';

export const useAssetClaimableRewards = ({
  poolAddress,
  assetAddress,
}: {
  poolAddress: string;
  assetAddress: string;
}) => {
  const { currentSdk, address } = useMultiMidas();

  return useQuery<FlywheelClaimableRewards[] | undefined>(
    ['useAssetClaimableRewards', poolAddress, assetAddress, address, currentSdk?.chainId],
    () => {
      if (currentSdk && address)
        return currentSdk.getFlywheelClaimableRewardsForAsset(poolAddress, assetAddress, address);
    },
    { enabled: !!poolAddress && !!address && !!currentSdk }
  );
};

export const useAssetsClaimableRewards = ({
  poolAddress,
  assetsAddress,
}: {
  poolAddress: string;
  assetsAddress: string[];
}) => {
  const { currentSdk, address } = useMultiMidas();

  return useQuery<{ [key: string]: FlywheelClaimableRewards[] } | undefined>(
    ['useAssetClaimableRewards', poolAddress, assetsAddress, address, currentSdk?.chainId],
    async () => {
      if (currentSdk && address) {
        const res: { [key: string]: FlywheelClaimableRewards[] } = {};

        const allRewards = await Promise.all(
          assetsAddress.map((assetAddress) =>
            currentSdk.getFlywheelClaimableRewardsForAsset(poolAddress, assetAddress, address)
          )
        );

        allRewards.map((reward) => {
          if (reward.length !== 0) {
            res[reward[0].rewards[0].market] = reward;
          }
        });

        return res;
      }
    },
    { enabled: !!poolAddress && !!address && !!currentSdk }
  );
};
