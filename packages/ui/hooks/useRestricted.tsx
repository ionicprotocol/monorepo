import { useQuery } from '@tanstack/react-query';

import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useSdk } from '@ui/hooks/fuse/useSdk';
import type { DebtCeilingPerCollateralType } from '@ui/hooks/useDebtCeilingForAssetForCollateral';

export const useRestricted = (
  poolChainId: number,
  comptrollerAddress: string,
  debtCeilings: DebtCeilingPerCollateralType[] | null | undefined
) => {
  const sdk = useSdk(poolChainId);
  const { address } = useMultiMidas();

  return useQuery(
    ['useRestricted', comptrollerAddress, debtCeilings, sdk?.chainId, address],
    async () => {
      const restricted: DebtCeilingPerCollateralType[] = [];

      if (sdk && debtCeilings && debtCeilings.length > 0 && address && comptrollerAddress) {
        const comptroller = sdk.createComptroller(comptrollerAddress, sdk.provider);

        await Promise.all(
          debtCeilings.map(async (debtCeiling) => {
            const [isAssetBlacklistWhitelist, isDebtCeilingWhitelist] = await Promise.all([
              comptroller.callStatic.borrowingAgainstCollateralBlacklistWhitelist(
                debtCeiling.asset.cToken,
                debtCeiling.collateralAsset.cToken,
                address
              ),
              comptroller.callStatic.borrowCapForCollateralWhitelist(
                debtCeiling.asset.cToken,
                debtCeiling.collateralAsset.cToken,
                address
              ),
            ]);

            if (!isAssetBlacklistWhitelist && !isDebtCeilingWhitelist) {
              restricted.push(debtCeiling);
            }
          })
        );
      }

      return restricted;
    },
    {
      cacheTime: Infinity,
      enabled:
        !!comptrollerAddress && !!debtCeilings && debtCeilings.length > 0 && !!address && !!sdk,
      staleTime: Infinity,
    }
  );
};
