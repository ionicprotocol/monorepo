import { MidasSdk } from '@midas-capital/sdk';
import { FlywheelClaimableRewards } from '@midas-capital/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useAssetClaimableRewards = ({
  poolAddress,
  assetAddress,
  poolChainId,
}: {
  poolAddress: string;
  assetAddress: string;
  poolChainId: number;
}) => {
  const { address } = useMultiMidas();
  const sdk = useSdk(poolChainId);

  return useQuery<FlywheelClaimableRewards[] | null | undefined>(
    ['useAssetClaimableRewards', poolAddress, assetAddress, address, sdk?.chainId],
    () => {
      if (sdk && address) {
        return sdk.getFlywheelClaimableRewardsForAsset(poolAddress, assetAddress, address);
      }

      return null;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolAddress && !!address && !!sdk,
    }
  );
};

export const getAssetsClaimableRewards = async (
  poolAddress: string,
  assetsAddress: string[],
  sdk: MidasSdk,
  address: string
) => {
  const allRewards = await Promise.all(
    assetsAddress.map((assetAddress) =>
      sdk.getFlywheelClaimableRewardsForAsset(poolAddress, assetAddress, address).catch((error) => {
        console.warn(`Unable to fetch claimable rewards for asset: '${assetAddress}'`, error);
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
};

export const useAssetsClaimableRewards = ({
  poolAddress,
  assetsAddress,
  poolChainId,
}: {
  poolAddress: string;
  assetsAddress: string[];
  poolChainId: number;
}) => {
  const { address } = useMultiMidas();
  const sdk = useSdk(poolChainId);

  return useQuery<{ [key: string]: FlywheelClaimableRewards[] } | null | undefined>(
    ['useAssetsClaimableRewards', poolAddress, assetsAddress, address, sdk?.chainId],
    async () => {
      if (sdk && address) {
        return await getAssetsClaimableRewards(poolAddress, assetsAddress, sdk, address);
      }

      return null;
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      enabled: !!poolAddress && !!address && !!sdk,
    }
  );
};
