import {
  CurveV1PoolConfig,
  LiquidityDepthConfig,
  LiquidityInvalidity,
  LiquidityPoolKind,
  UniswapV2AssetConfig,
  UniswapV3AssetConfig,
  VerifyLiquidityParams,
} from "../../types";

import { verifyCurveV1LiquidityDepth } from "./curveV1";
import { verifyUniswapV2LiquidityDepth } from "./uniswapV2";
import { verifyUniswapV3LiquidityDepth } from "./uniswapV3";

export async function verifyAMMLiquidity(
  poolKind: LiquidityPoolKind,
  config: LiquidityDepthConfig,
  args: VerifyLiquidityParams
): Promise<LiquidityInvalidity | true> {
  switch (poolKind) {
    case LiquidityPoolKind.UniswapV2:
      return await verifyUniswapV2LiquidityDepth(args.midasSdk, args.asset as UniswapV2AssetConfig, config);
    case LiquidityPoolKind.UniswapV3:
      return await verifyUniswapV3LiquidityDepth(args.midasSdk, args.asset as UniswapV3AssetConfig, config);
    case LiquidityPoolKind.CurveV1:
      return await verifyCurveV1LiquidityDepth(args.midasSdk, args.asset as CurveV1PoolConfig, config);
    default:
      return true;
  }
}
