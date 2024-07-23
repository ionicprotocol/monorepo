import type { NativePricedIonicAsset } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { Address, formatUnits } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';

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
  comptroller: Address;
  poolChainId: number;
}) => {
  const sdk = useSdk(poolChainId);
  const { address } = useMultiIonic();

  return useQuery({
    queryKey: [
      'useDebtCeilingForAssetForCollateral',
      poolChainId,
      assets.map((asset) => asset.cToken).sort(),
      collaterals.map((asset) => asset.cToken).sort(),
      comptrollerAddress,
      address
    ],

    queryFn: async () => {
      if (!sdk || collaterals.length === 0 || !address) return null;

      const debtCeilingPerCollateral: DebtCeilingPerCollateralType[] = [];
      const comptroller = sdk.createComptroller(
        comptrollerAddress,
        sdk.publicClient,
        sdk.walletClient
      );

      await Promise.all(
        assets.map(async (asset) => {
          await Promise.all(
            collaterals.map(async (collateralAsset) => {
              if (asset.cToken !== collateralAsset.cToken) {
                try {
                  const isInBlackList =
                    await comptroller.read.borrowingAgainstCollateralBlacklist([
                      asset.cToken,
                      collateralAsset.cToken
                    ]);

                  if (isInBlackList) {
                    debtCeilingPerCollateral.push({
                      asset,
                      collateralAsset,
                      debtCeiling: -1
                    });
                  } else {
                    const debtCeiling =
                      await comptroller.read.borrowCapForCollateral([
                        asset.cToken,
                        collateralAsset.cToken
                      ]);

                    if (debtCeiling > 0n) {
                      debtCeilingPerCollateral.push({
                        asset,
                        collateralAsset,
                        debtCeiling: Number(
                          formatUnits(debtCeiling, asset.underlyingDecimals)
                        )
                      });
                    }
                  }
                } catch (e) {
                  console.warn(
                    `Getting debt ceilings error: `,
                    {
                      cToken: asset.cToken,
                      collateralAsset,
                      comptrollerAddress
                    },
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

    gcTime: Infinity,
    enabled: !!sdk && collaterals.length > 0 && !!address,
    staleTime: Infinity
  });
};
