import { NativePricedFuseAsset } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';

export const useBorrowCapForAssetForCollateral = (
  comptrollerAddress: string,
  assets: NativePricedFuseAsset[],
  collateralAssets: NativePricedFuseAsset[],
  poolChainId: number
) => {
  const sdk = useSdk(poolChainId);

  return useQuery(
    [
      'useBorrowCapForAssetForCollateral',
      poolChainId,
      assets.sort((a, b) => a.cToken.localeCompare(b.cToken)),
      collateralAssets.sort((a, b) => a.cToken.localeCompare(b.cToken)),
    ],
    async () => {
      if (!sdk || collateralAssets.length === 0) return null;

      const borrowCapsPerCollateral: {
        asset: NativePricedFuseAsset;
        collateralAsset: NativePricedFuseAsset;
        borrowCap: number;
      }[] = [];
      const comptroller = sdk.createComptroller(comptrollerAddress, sdk.provider);

      await Promise.all(
        assets.map(async (asset) => {
          await Promise.all(
            collateralAssets.map(async (collateralAsset) => {
              if (asset.cToken !== collateralAsset.cToken) {
                const isInBlackList =
                  await comptroller.callStatic.borrowingAgainstCollateralBlacklist(
                    asset.cToken,
                    collateralAsset.cToken
                  );

                if (isInBlackList) {
                  borrowCapsPerCollateral.push({
                    asset,
                    collateralAsset,
                    borrowCap: -1,
                  });
                } else {
                  const borrowCap = await comptroller.callStatic.borrowCapForAssetForCollateral(
                    asset.cToken,
                    collateralAsset.cToken
                  );

                  if (borrowCap.gt(constants.Zero)) {
                    borrowCapsPerCollateral.push({
                      asset,
                      collateralAsset,
                      borrowCap: Number(utils.formatUnits(borrowCap, asset.underlyingDecimals)),
                    });
                  }
                }
              }
            })
          );
        })
      );

      return borrowCapsPerCollateral;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!sdk && collateralAssets.length > 0 }
  );
};
