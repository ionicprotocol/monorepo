import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const TotalSupply = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  return (
    <BalanceCell
      primary={{
        value: asset.totalSupplyFiat,
      }}
      secondary={{
        value: asset.totalSupply,
        symbol: tokenData?.symbol || '',
        decimals: asset.underlyingDecimals.toNumber(),
      }}
    />
  );
};
