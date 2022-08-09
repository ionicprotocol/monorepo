import { SupportedAsset } from '@midas-capital/types';

import { MarketData } from '@ui/hooks/useFusePoolData';

export const sortAssets = (assets: MarketData[]) => {
  return assets.sort((a, b) => {
    return b.underlyingSymbol.toLowerCase() > a.underlyingSymbol.toLowerCase() ? -1 : 1;
  });
};

export const sortSupportedAssets = (assets: SupportedAsset[]) => {
  return assets.sort((a, b) => {
    return b.symbol.toLowerCase() > a.symbol.toLowerCase() ? -1 : 1;
  });
};
