import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { useMultiIonic } from '@ui/context/MultiIonicContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import type { DebtCeilingPerCollateralType } from '@ui/hooks/useDebtCeilingForAssetForCollateral';

export const useRestricted = (
  poolChainId: number,
  comptrollerAddress: Address,
  debtCeilings: DebtCeilingPerCollateralType[] | null | undefined
) => {
  const sdk = useSdk(poolChainId);
  const { address } = useMultiIonic();

  return useQuery(
    ['useRestricted', comptrollerAddress, debtCeilings, sdk?.chainId, address],
    async () => {
      const restricted: DebtCeilingPerCollateralType[] = [];

      if (
        sdk &&
        debtCeilings &&
        debtCeilings.length > 0 &&
        address &&
        comptrollerAddress
      ) {
        try {
          const comptroller = sdk.createComptroller(
            comptrollerAddress,
            sdk.publicClient,
            sdk.walletClient
          );

          await Promise.all(
            debtCeilings.map(async (debtCeiling) => {
              const [isAssetBlacklistWhitelist, isDebtCeilingWhitelist] =
                await Promise.all([
                  comptroller.read.isBlacklistBorrowingAgainstCollateralWhitelisted(
                    [
                      debtCeiling.asset.cToken,
                      debtCeiling.collateralAsset.cToken,
                      address
                    ]
                  ),
                  comptroller.read.isBorrowCapForCollateralWhitelisted([
                    debtCeiling.asset.cToken,
                    debtCeiling.collateralAsset.cToken,
                    address
                  ])
                ]);

              if (!isAssetBlacklistWhitelist && !isDebtCeilingWhitelist) {
                restricted.push(debtCeiling);
              }
            })
          );
        } catch (e) {
          console.warn(`Getting restricted error: `, { comptrollerAddress }, e);
        }
      }

      return restricted;
    },
    {
      cacheTime: Infinity,
      enabled:
        !!comptrollerAddress &&
        !!debtCeilings &&
        debtCeilings.length > 0 &&
        !!address &&
        !!sdk,
      staleTime: Infinity
    }
  );
};
