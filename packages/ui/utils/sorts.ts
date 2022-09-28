import { FusePoolData, SupportedAsset } from '@midas-capital/types';

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

export const poolSort = (pools: FusePoolData[]) => {
  return pools.sort((a, b) => {
    if (b.totalSuppliedNative > a.totalSuppliedNative) {
      return 1;
    }

    if (b.totalSuppliedNative < a.totalSuppliedNative) {
      return -1;
    }

    // They're equal, let's sort by pool number:
    return b.id > a.id ? 1 : -1;
  });
};
