import { MidasSdk } from "@midas-capital/sdk";

import { InvalidReason, LiquidityDepthConfig, LiquidityValidity, UniswapV3AssetConfig } from "../../../types";

import { getPoolTVL } from "./uniswapV3";

export async function verifyUniswapV3LiquidityDepth(
  sdk: MidasSdk,
  asset: UniswapV3AssetConfig,
  config: LiquidityDepthConfig
): Promise<LiquidityValidity> {
  const liquidityDepthUSD = await getPoolTVL(sdk, asset);
  const minDepth = asset.minLiquidity ?? config.minLiquidity;

  if (liquidityDepthUSD < minDepth) {
    return {
      invalidReason: InvalidReason.TWAP_LIQUIDITY_LOW,
      message: `Pool has too low liquidity`,
      valueUSD: liquidityDepthUSD,
    };
  }
  return true;
}
