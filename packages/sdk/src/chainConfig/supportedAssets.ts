import { SupportedChains } from "../enums";
import { ChainSupportedAssets } from "../types";
import {
  bscAssets,
  chapelAssets,
  evmosAssets,
  evmosTestnetAssets,
  moonbaseAlphaAssets,
  moonbeamAssets,
  auroraAssets,
  ganacheAssets,
} from "./assets";

const chainSupportedAssets: ChainSupportedAssets = {
  [SupportedChains.ganache]: ganacheAssets,
  [SupportedChains.evmos]: evmosAssets,
  [SupportedChains.evmos_testnet]: evmosTestnetAssets,
  [SupportedChains.bsc]: bscAssets,
  [SupportedChains.chapel]: chapelAssets,
  [SupportedChains.moonbase_alpha]: moonbaseAlphaAssets,
  [SupportedChains.moonbeam]: moonbeamAssets,
  [SupportedChains.aurora]: auroraAssets,
};

export default chainSupportedAssets;
