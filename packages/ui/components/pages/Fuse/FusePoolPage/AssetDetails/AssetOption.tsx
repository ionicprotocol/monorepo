import { useColors } from '@ui/hooks/useColors';
import { useTokenData } from '@ui/hooks/useTokenData';
import { MarketData } from '@ui/types/TokensDataMap';

export const AssetOption = ({ asset }: { asset: MarketData }) => {
  const { data: tokenData } = useTokenData(asset.underlyingToken);
  const { cPage } = useColors();

  return (
    <option value={asset.cToken} key={asset.cToken} style={{ color: cPage.primary.txtColor }}>
      {tokenData?.symbol ?? asset.underlyingSymbol}
    </option>
  );
};
