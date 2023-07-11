import { SupportedChains } from "@ionicprotocol/types";

export enum LiquidityPoolKind {
  UniswapV2 = "UniswapV2",
  UniswapV3 = "UniswapV3",
  Curve = "Curve",
  Balancer = "Balancer",
}

export enum LiquidityMonitorChains {
  bsc = SupportedChains.bsc,
  polygon = SupportedChains.polygon,
}
