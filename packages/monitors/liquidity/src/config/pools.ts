import { bsc, moonbeam, polygon } from "@midas-capital/chains";
import { assetFilter, assetSymbols, underlying } from "@midas-capital/types";

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
      {
        token0: underlying(bsc.assets, assetSymbols.BNBx),
        token1: underlying(bsc.assets, assetSymbols.WBNB),
        affectedAssets: [assetFilter(bsc.assets, assetSymbols.BNBx)],
        alternativeFactory: "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6",
        identifier: "ApeSwap BNBx-WBNB",
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
  [LiquidityMonitorChains.moonbeam]: {
    [LiquidityPoolKind.UniswapV2]: [],
    [LiquidityPoolKind.UniswapV3]: [],
    [LiquidityPoolKind.Curve]: [
      {
        poolAddress: underlying(moonbeam.assets, assetSymbols["xcDOT-stDOT"]),
        affectedAssets: [
          assetFilter(moonbeam.assets, assetSymbols.xcDOT),
          assetFilter(moonbeam.assets, assetSymbols.stDOT),
        ],
        identifier: "Curve xcDOT-stDOT",
      },
    ],
    [LiquidityPoolKind.Balancer]: [],
  },
};
