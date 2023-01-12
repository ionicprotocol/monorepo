import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';

import { useSdk } from '@ui/hooks/fuse/useSdk';
import { MarketData } from '@ui/types/TokensDataMap';

export const useBorrowCapForAssetForCollateral = (
  comptrollerAddress: string,
  assets: MarketData[],
  collateralAssets: MarketData[],
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
        asset: string;
        collateralAsset: string;
        borrowCap: number;
      }[] = [];
      const comptroller = sdk.createComptroller(comptrollerAddress, sdk.provider);

      await Promise.all(
        assets.map((asset) => {
          collateralAssets.map(async (collateralAsset) => {
            if (asset.cToken !== collateralAsset.cToken) {
              const isInBlackList =
                await comptroller.callStatic.borrowingAgainstCollateralBlacklist(
                  asset.cToken,
                  collateralAsset.cToken
                );

              if (isInBlackList) {
                borrowCapsPerCollateral.push({
                  asset: asset.cToken,
                  collateralAsset: collateralAsset.cToken,
                  borrowCap: -1,
                });
              } else {
                const borrowCap = await comptroller.callStatic.borrowCapForAssetForCollateral(
                  asset.cToken,
                  collateralAsset.cToken
                );

                if (borrowCap.gt(constants.Zero)) {
                  borrowCapsPerCollateral.push({
                    asset: asset.cToken,
                    collateralAsset: collateralAsset.cToken,
                    borrowCap: Number(utils.formatUnits(borrowCap, asset.underlyingDecimals)),
                  });
                }
              }
            }
          });
        })
      );

      return borrowCapsPerCollateral;
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!sdk && collateralAssets.length > 0 }
  );
};
