import { ChainSupportedAssets } from "../Fuse/types";
import { SupportedChains } from "./index";
import {
  bscAssets,
  chapelAssets,
  evmosAssets,
  evmosTestnetAssets,
  moonbaseAlphaAssets,
  moonbeamAssets,
  auroraAssets,
} from "./assets";

export const chainSupportedAssets: ChainSupportedAssets = {
  [SupportedChains.ganache]: evmosAssets,
  [SupportedChains.evmos]: evmosAssets,
  [SupportedChains.evmos_testnet]: evmosTestnetAssets,
  [SupportedChains.bsc]: bscAssets,
  [SupportedChains.chapel]: chapelAssets,
  [SupportedChains.moonbase_alpha]: moonbaseAlphaAssets,
  [SupportedChains.moonbeam]: moonbeamAssets,
  [SupportedChains.aurora]: auroraAssets,
};
