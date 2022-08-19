import { SupportedAsset } from '@midas-capital/types';

import { MarketData } from '@ui/types/TokensDataMap';

export const sortAssets = (assets: MarketData[]) => {
  return assets.sort((a, b) => {
    return a.underlyingSymbol.localeCompare(b.underlyingSymbol);
  });
};

export const sortSupportedAssets = (assets: SupportedAsset[]) => {
  return assets.sort((a, b) => {
    return a.symbol.localeCompare(b.symbol);
  });
};
