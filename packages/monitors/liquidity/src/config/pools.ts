import { bsc, moonbeam, polygon } from "@midas-capital/chains";
import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains, underlying } from "@midas-capital/types";

import { chainIdToConfig, Services, UniswapV2AssetConfig } from "../types";

import { baseConfig } from "./variables";

enum LiquidityMonitorChains {
  bsc = SupportedChains.bsc,
  polygon = SupportedChains.polygon,
  moonbeam = SupportedChains.moonbeam,
}

const MONITORED_UNISWAP_V2_POOLS: { [key in LiquidityMonitorChains]: UniswapV2AssetConfig[] } = {
  [SupportedChains.bsc]: [
    {
      token0: underlying(bsc.assets, assetSymbols.stkBNB),
      token1: underlying(bsc.assets, assetSymbols.WBNB),
    },
    {
      token0: underlying(bsc.assets, assetSymbols.BNBx),
      token1: underlying(bsc.assets, assetSymbols.WBNB),
    },
  ],
  [SupportedChains.polygon]: [],
  [SupportedChains.moonbeam]: [],
};

const MONITORED_UNISWAP_V3_POOLS = {
  [SupportedChains.polygon]: [],
  [SupportedChains.arbitrum]: [],
};

const MONITORED_CURVE_POOLS = {
  [SupportedChains.polygon]: [],
  [SupportedChains.bsc]: [],
  [SupportedChains.arbitrum]: [],
};
