import { BalanceCell } from '@ui/components/shared/BalanceCell';
import { FundedAsset } from '@ui/hooks/useAllFundedInfo';
import { useSupplyCap } from '@ui/hooks/useSupplyCap';
import { useTokenData } from '@ui/hooks/useTokenData';

export const TotalSupply = ({ asset }: { asset: FundedAsset }) => {
  const poolChainId = Number(asset.chainId);
  const comptrollerAddress = asset.comptroller;
  const { data: tokenData } = useTokenData(asset.underlyingToken, poolChainId);
  const { data: supplyCaps } = useSupplyCap({
    comptroller: comptrollerAddress,
    chainId: poolChainId,
    market: asset,
  });

  return (
    <BalanceCell
      cap={supplyCaps}
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
