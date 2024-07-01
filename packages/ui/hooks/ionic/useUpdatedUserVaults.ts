import type { FundOperationMode, VaultData } from '@ionicprotocol/types';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useSdk } from '@ui/hooks/ionic/useSdk';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';

interface UseUpdatedUserVaultResult {
  amount: bigint;
  mode: FundOperationMode;
  vault: VaultData;
}

export const useUpdatedUserVault = ({
  mode,
  amount,
  vault
}: UseUpdatedUserVaultResult) => {
  const sdk = useSdk(Number(vault.chainId));
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[vault.chainId.toString()]) {
      return usdPrices[vault.chainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, vault.chainId]);

  return useQuery(
    ['useUpdatedUserVault', mode, vault, amount, usdPrice, sdk?.chainId],
    async () => {
      if (!vault || !usdPrice || !sdk) return null;

      return await sdk.getUpdatedVault(mode, vault, amount).catch((e) => {
        console.warn(`Updated vaults error: `, { amount, mode, vault }, e);

        return null;
      });
    },
    { enabled: !!vault && !!usdPrice && !!sdk }
  );
};
