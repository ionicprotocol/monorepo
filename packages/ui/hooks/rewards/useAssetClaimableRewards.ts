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

  return useQuery<FlywheelClaimableRewards[] | null | undefined>(
    ['useAssetClaimableRewards', poolAddress, assetAddress, address, currentSdk?.chainId],
    () => {
      if (currentSdk && address) {
        return currentSdk.getFlywheelClaimableRewardsForAsset(poolAddress, assetAddress, address);
      }

      return null;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolAddress && !!address && !!currentSdk,
    }
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

  return useQuery<{ [key: string]: FlywheelClaimableRewards[] } | null | undefined>(
    ['useAssetsClaimableRewards', poolAddress, assetsAddress, address, currentSdk?.chainId],
    async () => {
      if (currentSdk && address) {
        const allRewards = await Promise.all(
          assetsAddress.map((assetAddress) =>
            currentSdk
              .getFlywheelClaimableRewardsForAsset(poolAddress, assetAddress, address)
              .catch((error) => {
                console.warn(
                  `Unable to fetch claimable rewards for asset: '${assetAddress}'`,
                  error
                );
                return undefined;
              })
          )
        );

        const res: { [key: string]: FlywheelClaimableRewards[] } = {};
        allRewards.map((reward) => {
          if (reward && reward.length !== 0) {
            res[reward[0].rewards[0].market] = reward;
          }
        });

        return res;
      }

      return null;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolAddress && !!address && !!currentSdk,
    }
  );
};
