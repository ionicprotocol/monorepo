import type { IonicSdk } from '@ionicprotocol/sdk';
import type { FlywheelClaimableRewards } from '@ionicprotocol/sdk/dist/cjs/src/modules/Flywheel';
import { useQuery } from '@tanstack/react-query';
import { constants } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useAssetClaimableRewards = (
  marketAddress: string,
  poolAddress: string,
  poolChainId?: number
) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: [
      'useAssetClaimableRewards',
      poolAddress,
      marketAddress,
      address,
      sdk?.chainId
    ],

    queryFn: async () => {
      if (sdk && poolAddress && marketAddress && address) {
        try {
          const rewards = await sdk.getFlywheelClaimableRewardsForMarket(
            poolAddress,
            marketAddress,
            address
          );

          return rewards.filter((reward) => reward.amount.gt(constants.Zero));
        } catch (e) {
          console.warn('Getting market claimable rewards error: ', {
            address,
            marketAddress,
            poolAddress,
            poolChainId
          });

          return null;
        }
      }

      return null;
    },

    gcTime: Infinity,
    enabled: !!poolAddress && !!marketAddress && !!address && !!sdk,
    staleTime: Infinity
  });
};

export const getAssetsClaimableRewards = async (
  poolAddress: string,
  assetsAddress: string[],
  sdk: IonicSdk,
  address: string
) => {
  const allRewards = await Promise.all(
    assetsAddress.map(async (assetAddress) => {
      try {
        return await sdk.getFlywheelClaimableRewardsForMarket(
          poolAddress,
          assetAddress,
          address
        );
      } catch (error) {
        console.warn(
          `Unable to fetch claimable rewards for asset: '${assetAddress}'`,
          error
        );
        return null;
      }
    })
  );

  const res: { [key: string]: FlywheelClaimableRewards[] } = {};
  allRewards.map((reward, i) => {
    if (reward && reward.length !== 0) {
      res[assetsAddress[i]] = reward;
    }
  });

  return res;
};

export const useAssetsClaimableRewards = ({
  poolAddress,
  assetsAddress,
  poolChainId
}: {
  assetsAddress: string[];
  poolAddress: string;
  poolChainId: number;
}) => {
  const { address } = useMultiIonic();
  const sdk = useSdk(poolChainId);

  return useQuery({
    queryKey: [
      'useAssetsClaimableRewards',
      poolAddress,
      assetsAddress,
      address,
      sdk?.chainId
    ],

    queryFn: async () => {
      if (sdk && address) {
        return await getAssetsClaimableRewards(
          poolAddress,
          assetsAddress,
          sdk,
          address
        );
      }

      return null;
    },

    gcTime: Infinity,
    enabled: !!poolAddress && !!address && !!sdk,
    staleTime: Infinity
  });
};
