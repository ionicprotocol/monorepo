import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const TotalSupply = ({
  asset,
  comptrollerAddress,
  poolChainId,
}: {
  asset: MarketData;
  comptrollerAddress: string;
  poolChainId: number;
}) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const { data: supplyCaps } = useSupplyCap(
    comptrollerAddress,
    asset.cToken,
    asset.underlyingPrice,
    poolChainId
  );

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
      cap={supplyCaps}
    />
  );
};
