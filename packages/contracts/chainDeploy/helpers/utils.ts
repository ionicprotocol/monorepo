import { SupportedAsset } from "@ionicprotocol/types";
import { Address } from "viem";

export const underlying = (assets: SupportedAsset[], symbol: string): Address => {
  return assetFilter(assets, symbol).underlying;
};

export const assetArrayToMap = (assets: SupportedAsset[]): { [key: string]: SupportedAsset } =>
  assets.reduce(
    (acc, curr) => {
      acc[curr.underlying] = curr;
      return acc;
    },
    {} as Record<string, SupportedAsset>
  );

export const assetFilter = (assets: SupportedAsset[], symbol: string): SupportedAsset => {
  const asset = assets.find((a: SupportedAsset) => a.symbol === symbol);
  if (!asset) throw new Error(`no such SupportedAsset with symbol ${symbol} in assets ${JSON.stringify(assets)}`);
  return asset;
};
