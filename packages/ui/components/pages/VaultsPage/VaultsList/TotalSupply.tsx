import { useEffect, useMemo, useState } from 'react';
import type { VaultData } from 'types/dist';

import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useAllUsdPrices } from '@ui/hooks/useAllUsdPrices';
import { useTokenData } from '@ui/hooks/useTokenData';

export const TotalSupply = ({ vault }: { vault: VaultData }) => {
  const [usdBalance, setUsdBalance] = useState<number>(0);
  const { data: tokenData } = useTokenData(vault.asset, Number(vault.chainId));
  const { data: usdPrices } = useAllUsdPrices();
  const usdPrice = useMemo(() => {
    if (usdPrices && usdPrices[vault.chainId.toString()]) {
      return usdPrices[vault.chainId.toString()].value;
    } else {
      return undefined;
    }
  }, [usdPrices, vault.chainId]);

  useEffect(() => {
    if (usdPrice) {
      const usdBalance = vault.totalSupplyNative * usdPrice;

      setUsdBalance(usdBalance);
    } else {
      setUsdBalance(0);
    }
  }, [usdPrice, vault]);

  return (
    <BalanceCell
      primary={{
        value: usdBalance,
      }}
      secondary={{
        decimals: vault.decimals,
        symbol: tokenData?.symbol || '',
        value: vault.totalSupply,
      }}
    />
  );
};
