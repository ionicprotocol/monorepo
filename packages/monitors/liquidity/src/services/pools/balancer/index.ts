import { MidasSdk } from "@ionicprotocol/sdk";

import { BalancerPoolConfig, InvalidReason, LiquidityDepthConfig, LiquidityValidity } from "../../../types";
import { getPoolTVL } from "../utils";

import { BalancerFetcher } from "./fetcher";

export async function verifyBalancerLiquidityDepth(
  sdk: MidasSdk,
  asset: BalancerPoolConfig,
  config: LiquidityDepthConfig
): Promise<LiquidityValidity> {
  const minDepth = asset.minLiquidity ?? config.minLiquidity;

  const fetcher = new BalancerFetcher(sdk, asset.poolAddress);
  const reserves = await fetcher.getReserves();

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
