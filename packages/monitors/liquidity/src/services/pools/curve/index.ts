import { IonicSdk } from "@ionicprotocol/sdk";

import { CurvePoolConfig, InvalidReason, LiquidityDepthConfig, LiquidityValidity } from "../../../types";

import { fetchCurvePoolTvl } from "./fetcher";

export async function verifyCurveLiquidityDepth(
  sdk: IonicSdk,
  asset: CurvePoolConfig,
  config: LiquidityDepthConfig
): Promise<LiquidityValidity> {
  const minDepth = asset.minLiquidity ?? config.minLiquidity;
  const liquidityDepthUSD = await fetchCurvePoolTvl(sdk, asset.poolAddress);

  console.log({ liquidityDepthUSD, minDepth });
  if (liquidityDepthUSD < minDepth) {
    return {
      invalidReason: InvalidReason.POOL_LIQUIDITY_BELOW_THRESHOLD,
      message: `Pool has too low liquidity`,
      extraInfo: {
        valueUSD: liquidityDepthUSD,
      },
    };
  }
  return true;
}
