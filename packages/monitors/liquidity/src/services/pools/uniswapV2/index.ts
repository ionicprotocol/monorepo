import { IonicSdk } from "@ionicprotocol/sdk";

import { InvalidReason, LiquidityDepthConfig, LiquidityValidity, UniswapV2AssetConfig } from "../../../types";
import { getPoolTVL } from "../utils";

import { V2Fetcher } from "./fetcher";

export async function verifyUniswapV2LiquidityDepth(
  sdk: IonicSdk,
  asset: UniswapV2AssetConfig,
  config: LiquidityDepthConfig
): Promise<LiquidityValidity> {
  const uniswapV2Factory = asset.alternativeFactory ?? sdk.chainSpecificAddresses.UNISWAP_V2_FACTORY;
  const minDepth = asset.minLiquidity ?? config.minLiquidity;

  const fetcher = new V2Fetcher(sdk, uniswapV2Factory);
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
