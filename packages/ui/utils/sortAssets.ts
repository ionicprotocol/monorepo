import { MarketData } from '@ui/hooks/useFusePoolData';

export const sortAssets = (assets: MarketData[]) => {
  return assets.sort((a, b) => {
    return b.underlyingSymbol > a.underlyingSymbol ? -1 : 1;
  });
};
