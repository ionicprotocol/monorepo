import {
  ChainSupportedAssets as ChainSupportedAssetsType,
  SupportedAsset,
  SupportedChains,
} from "@midas-capital/types";

import {
  bscAssets,
  chapelAssets,
  evmosAssets,
  ganacheAssets,
  moonbeamAssets,
  neonDevnetAssets,
  polygonAssets,
} from "./assets";

const assetArrayToMap = (assets: SupportedAsset[]): { [key: string]: SupportedAsset } =>
  assets.reduce((acc, curr) => {
    acc[curr.underlying] = curr;
    return acc;
  }, {});

export const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.ganache]: ganacheAssets,
  [SupportedChains.evmos]: evmosAssets,
  [SupportedChains.bsc]: bscAssets,
  [SupportedChains.chapel]: chapelAssets,
  [SupportedChains.moonbeam]: moonbeamAssets,
  [SupportedChains.neon_devnet]: neonDevnetAssets,
  [SupportedChains.polygon]: polygonAssets,
};

export const ChainSupportedAssetsMap: { [key in SupportedChains]?: ReturnType<typeof assetArrayToMap> } =
  Object.entries(ChainSupportedAssets).reduce((acc, [key, value]) => {
    acc[key] = assetArrayToMap(value);
    return acc;
  }, {});

export const underlying = function (assets: SupportedAsset[], symbol: string): string {
  const asset = assets.find((a: SupportedAsset) => a.symbol === symbol);
  if (!asset) throw new Error(`no such SupportedAsset with symbol ${symbol} in assets ${JSON.stringify(assets)}`);
  return asset.underlying;
};

export default ChainSupportedAssets;
