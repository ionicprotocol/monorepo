import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useBorrowCap } from '@ui/hooks/useBorrowCap';
import { useTokenData } from '@ui/hooks/useTokenData';
import type { MarketData } from '@ui/types/TokensDataMap';

export const TotalBorrow = ({
  asset,
  comptroller,
  chainId
}: {
  asset: MarketData;
  chainId: number;
  comptroller: string;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, chainId);
  const { data: borrowCaps } = useBorrowCap({
    chainId,
    comptroller,
    market: asset
  });

  return (
    <BalanceCell
      cap={borrowCaps}
      primary={{
        value: asset.totalBorrowFiat
      }}
      secondary={{
        decimals: asset.underlyingDecimals.toNumber(),
        symbol: tokenData?.symbol || '',
        value: asset.totalBorrow
      }}
    />
  );
};
