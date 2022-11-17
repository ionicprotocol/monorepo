import { MidasSdk } from "@midas-capital/sdk";

import { CurveV1PoolConfig, LiquidityDepthConfig, LiquidityValidity } from "../../../types";

export async function verifyCurveV1LiquidityDepth(
  sdk: MidasSdk,
  asset: CurveV1PoolConfig,
  config: LiquidityDepthConfig
): Promise<LiquidityValidity> {
  console.debug(sdk, asset, config);
  return true;
}
