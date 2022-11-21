import { SupportedChains } from "@midas-capital/types";

export enum LiquidityPoolKind {
  UniswapV2 = "UniswapV2",
  UniswapV3 = "UniswapV3",
  CurveV1 = "CurveV1",
  Balancer = "Balancer",
}

export enum LiquidityMonitorChains {
  bsc = SupportedChains.bsc,
  polygon = SupportedChains.polygon,
  moonbeam = SupportedChains.moonbeam,
}
