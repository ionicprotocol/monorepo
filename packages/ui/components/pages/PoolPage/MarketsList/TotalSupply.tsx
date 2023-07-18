import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const TotalSupply = ({
  asset,
  comptrollerAddress,
  poolChainId
}: {
  asset: MarketData;
  comptrollerAddress: string;
  poolChainId: number;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const { data: supplyCaps } = useSupplyCap({
    chainId: poolChainId,
    comptroller: comptrollerAddress,
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
