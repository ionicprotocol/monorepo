import { bsc, polygon } from "@ionicprotocol/chains";
import { assetFilter, assetSymbols, underlying } from "@ionicprotocol/types";

import { LiquidityMonitorChains, LiquidityPoolKind, MonitoredChainAssets } from "../types";

export const MONITORED_CHAIN_ASSETS: MonitoredChainAssets = {
  [LiquidityMonitorChains.bsc]: {
    [LiquidityPoolKind.UniswapV2]: [
      {
        token0: underlying(bsc.assets, assetSymbols.stkBNB),
        token1: underlying(bsc.assets, assetSymbols.WBNB),
        affectedAssets: [assetFilter(bsc.assets, assetSymbols.stkBNB)],
        identifier: "PCS stkBNB-WBNB",
      },
    ],
    [LiquidityPoolKind.UniswapV3]: [],
    [LiquidityPoolKind.Curve]: [],
    [LiquidityPoolKind.Balancer]: [],
  },
  [LiquidityMonitorChains.polygon]: {
    [LiquidityPoolKind.UniswapV2]: [],
    [LiquidityPoolKind.UniswapV3]: [],
    [LiquidityPoolKind.Curve]: [],
    [LiquidityPoolKind.Balancer]: [
      {
        poolAddress: underlying(polygon.assets, assetSymbols.MIMO_PAR_80_20),
        affectedAssets: [assetFilter(polygon.assets, assetSymbols.MIMO_PAR_80_20)],
        identifier: "Balancer MIMO_PAR_80_20",
      },
    ],
  },
};
