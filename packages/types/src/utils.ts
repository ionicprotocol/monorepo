import { SupportedAsset } from "./types";

export const underlying = function (assets: SupportedAsset[], symbol: string): string {
  const asset = assets.find((a: SupportedAsset) => a.symbol === symbol);
  if (!asset) throw new Error(`no such SupportedAsset with symbol ${symbol} in assets ${JSON.stringify(assets)}`);
  return asset.underlying;
};

export const assetArrayToMap = (assets: SupportedAsset[]): { [key: string]: SupportedAsset } =>
  assets.reduce((acc, curr) => {
    acc[curr.underlying] = curr;
    return acc;
  }, {});
