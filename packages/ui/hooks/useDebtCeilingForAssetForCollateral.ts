import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { constants, utils } from 'ethers';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/ionic/useSdk';

export interface DebtCeilingPerCollateralType {
  asset: NativePricedIonicAsset;
  collateralAsset: NativePricedIonicAsset;
  debtCeiling: number;
}

export const useDebtCeilingForAssetForCollateral = ({
  assets,
  collaterals,
  comptroller: comptrollerAddress,
  poolChainId
}: {
  assets: NativePricedIonicAsset[];
  collaterals: NativePricedIonicAsset[];
  comptroller: string;
  poolChainId: number;
}) => {
  const sdk = useSdk(poolChainId);
  const { address } = useMultiIonic();

  return useQuery(
    [
      'useDebtCeilingForAssetForCollateral',
      poolChainId,
      assets.map((asset) => asset.cToken).sort(),
      collaterals.map((asset) => asset.cToken).sort(),
      comptrollerAddress,
      address
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
                try {
                  const isInBlackList =
                    await comptroller.callStatic.borrowingAgainstCollateralBlacklist(
                      asset.cToken,
                      collateralAsset.cToken
                    );

                  if (isInBlackList) {
                    debtCeilingPerCollateral.push({
                      asset,
                      collateralAsset,
                      debtCeiling: -1
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
                        debtCeiling: Number(
                          utils.formatUnits(debtCeiling, asset.underlyingDecimals)
                        )
                      });
                    }
                  }
                } catch (e) {
                  console.warn(
                    `Getting debt ceilings error: `,
                    { cToken: asset.cToken, collateralAsset, comptrollerAddress },
                    e
                  );
                }
              }
            })
          );
        })
      );

      return debtCeilingPerCollateral;
    },
    {
      enabled: !!sdk && collaterals.length > 0 && !!address
    }
  );
};
