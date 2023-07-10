import { IonicSdk } from "@ionicprotocol/sdk";

import { InvalidReason, LiquidityDepthConfig, LiquidityValidity, UniswapV3AssetConfig } from "../../../types";
import { getPoolTVL } from "../utils";

import { V3Fetcher } from "./fetcher";

export async function verifyUniswapV3LiquidityDepth(
  sdk: IonicSdk,
  asset: UniswapV3AssetConfig,
  config: LiquidityDepthConfig
): Promise<LiquidityValidity> {
  const minDepth = asset.minLiquidity ?? config.minLiquidity;

  const fetcher = new V3Fetcher(sdk);
  const reserves = await fetcher.getPairReserves(asset);

  const liquidityDepthUSD = await getPoolTVL(sdk, reserves);
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
