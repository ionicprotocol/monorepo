import { SupportedAsset } from "./chain";

export const underlying = function (assets: SupportedAsset[], symbol: string): string {
  return assetFilter(assets, symbol).underlying;
};

export const assetArrayToMap = (assets: SupportedAsset[]): { [key: string]: SupportedAsset } =>
  assets.reduce((acc, curr) => {
    acc[curr.underlying] = curr;
    return acc;
  }, {});

export const assetFilter = function (assets: SupportedAsset[], symbol: string): SupportedAsset {
  const asset = assets.find((a: SupportedAsset) => a.symbol === symbol);
  if (!asset) throw new Error(`no such SupportedAsset with symbol ${symbol} in assets ${JSON.stringify(assets)}`);
  return asset;
};
