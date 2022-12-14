import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const TotalBorrow = ({ asset, poolChainId }: { asset: MarketData; poolChainId: number }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);

  return (
    <BalanceCell
      primary={{
        value: asset.totalBorrowFiat,
      }}
      secondary={{
        value: asset.totalBorrow,
        symbol: tokenData?.symbol || '',
        decimals: asset.underlyingDecimals.toNumber(),
      }}
    />
  );
};
