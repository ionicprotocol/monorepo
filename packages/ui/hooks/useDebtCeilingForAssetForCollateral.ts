import type { NativePricedFuseAsset } from '@midas-capital/types';
import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

export interface DebtCeilingPerCollateralType {
  asset: NativePricedFuseAsset;
  collateralAsset: NativePricedFuseAsset;
  debtCeiling: number;
}

export const useDebtCeilingForAssetForCollateral = ({
  assets,
  collaterals,
  comptroller: comptrollerAddress,
  poolChainId,
}: {
  assets: NativePricedFuseAsset[];
  collaterals: NativePricedFuseAsset[];
  comptroller: string;
  poolChainId: number;
}) => {
  const sdk = useSdk(poolChainId);
  const { address } = useMultiMidas();

  return useQuery(
    [
      'useDebtCeilingForAssetForCollateral',
      poolChainId,
      assets.map((asset) => asset.cToken).sort(),
      collaterals.map((asset) => asset.cToken).sort(),
      comptrollerAddress,
      address,
    ],
    async () => {
      if (!sdk || collaterals.length === 0 || !address) return null;

      const debtCeilingPerCollateral: DebtCeilingPerCollateralType[] = [];
      const comptroller = sdk.createComptroller(comptrollerAddress, sdk.provider);

      await Promise.all(
        assets.map(async (asset) => {
          await Promise.all(
            collaterals.map(async (collateralAsset) => {
              if (asset.cToken !== collateralAsset.cToken) {
                const isInBlackList =
                  await comptroller.callStatic.borrowingAgainstCollateralBlacklist(
                    asset.cToken,
                    collateralAsset.cToken
                  );

                if (isInBlackList) {
                  debtCeilingPerCollateral.push({
                    asset,
                    collateralAsset,
                    debtCeiling: -1,
                  });
                } else {
                  const debtCeiling = await comptroller.callStatic.borrowCapForCollateral(
                    asset.cToken,
                    collateralAsset.cToken
                  );

                  if (debtCeiling.gt(constants.Zero)) {
                    debtCeilingPerCollateral.push({
                      asset,
                      collateralAsset,
                      debtCeiling: Number(utils.formatUnits(debtCeiling, asset.underlyingDecimals)),
                    });
                  }
                }
              }
            })
          );
        })
      );

      return debtCeilingPerCollateral;
    },
    {
      cacheTime: Infinity,
      enabled: !!sdk && collaterals.length > 0 && !!address,
      staleTime: Infinity,
    }
  );
};
