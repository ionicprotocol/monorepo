import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const TotalSupply = ({
  asset,
  comptroller,
  chainId
}: {
  asset: MarketData;
  chainId: number;
  comptroller: string;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, chainId);
  const { data: supplyCaps } = useSupplyCap({
    chainId,
    comptroller,
    market: asset
  });

  return (
    <BalanceCell
      cap={supplyCaps}
      primary={{
        value: asset.totalSupplyFiat
      }}
      secondary={{
        decimals: asset.underlyingDecimals.toNumber(),
        symbol: tokenData?.symbol || '',
        value: asset.totalSupply
      }}
    />
  );
};
