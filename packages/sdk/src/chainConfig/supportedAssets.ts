import { SupportedChains } from "../enums";
import { ChainSupportedAssets as ChainSupportedAssetsType, SupportedAsset } from "../types";

import {
  auroraAssets,
  bscAssets,
  chapelAssets,
  evmosAssets,
  evmosTestnetAssets,
  ganacheAssets,
  moonbaseAlphaAssets,
  moonbeamAssets,
  mumbaiAssets,
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
  [SupportedChains.evmos_testnet]: evmosTestnetAssets,
  [SupportedChains.bsc]: bscAssets,
  [SupportedChains.chapel]: chapelAssets,
  [SupportedChains.moonbase_alpha]: moonbaseAlphaAssets,
  [SupportedChains.moonbeam]: moonbeamAssets,
  [SupportedChains.aurora]: auroraAssets,
  [SupportedChains.neon_devnet]: neonDevnetAssets,
  [SupportedChains.polygon]: polygonAssets,
  [SupportedChains.mumbai]: mumbaiAssets,
};

export const ChainSupportedAssetsMap: { [key in SupportedChains]?: ReturnType<typeof assetArrayToMap> } =
  Object.entries(ChainSupportedAssets).reduce((acc, [key, value]) => {
    acc[key] = assetArrayToMap(value);
    return acc;
  }, {});

export default ChainSupportedAssets;
