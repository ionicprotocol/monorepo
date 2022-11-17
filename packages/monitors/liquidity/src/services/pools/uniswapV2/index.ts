import { MidasSdk } from "@midas-capital/sdk";

import { InvalidReason, LiquidityDepthConfig, LiquidityValidity, UniswapV2AssetConfig } from "../../../types";

import { V2Fetcher } from "./fetcher";
import { getPoolTVL } from "./uniswapV2";

export async function verifyUniswapV2LiquidityDepth(
  sdk: MidasSdk,
  asset: UniswapV2AssetConfig,
  config: LiquidityDepthConfig
): Promise<LiquidityValidity> {
  const uniswapV2Factory = asset.alternativeFactory ?? sdk.chainSpecificAddresses.UNISWAP_V2_FACTORY;
  const minDepth = asset.minLiquidity ?? config.minLiquidity;

  const fetcher = new V2Fetcher(sdk, uniswapV2Factory);
  const reserves = await fetcher.getPairReserves(asset.token0, asset.token1);
  const liquidityDepthUSD = await getPoolTVL(sdk, reserves);

  if (liquidityDepthUSD < minDepth) {
    return {
      invalidReason: InvalidReason.TWAP_LIQUIDITY_LOW,
      message: `Pool has too low liquidity`,
      valueUSD: liquidityDepthUSD,
    };
  }
  return true;
}
