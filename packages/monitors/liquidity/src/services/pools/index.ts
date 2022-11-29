import {
  BalancerPoolConfig,
  CurvePoolConfig,
  LiquidityDepthConfig,
  LiquidityInvalidity,
  LiquidityPoolKind,
  UniswapV2AssetConfig,
  UniswapV3AssetConfig,
  VerifyLiquidityParams,
} from "../../types";

import { verifyBalancerLiquidityDepth } from "./balancer";
import { verifyCurveLiquidityDepth } from "./curve";
import { verifyUniswapV2LiquidityDepth } from "./uniswapV2";
import { verifyUniswapV3LiquidityDepth } from "./uniswapV3";

export async function verifyAMMLiquidity(
  config: LiquidityDepthConfig,
  args: VerifyLiquidityParams
): Promise<LiquidityInvalidity | true> {
  switch (args.poolKind) {
    case LiquidityPoolKind.UniswapV2:
      return await verifyUniswapV2LiquidityDepth(args.midasSdk, args.asset as UniswapV2AssetConfig, config);
    case LiquidityPoolKind.UniswapV3:
      return await verifyUniswapV3LiquidityDepth(args.midasSdk, args.asset as UniswapV3AssetConfig, config);
    case LiquidityPoolKind.Curve:
      return await verifyCurveLiquidityDepth(args.midasSdk, args.asset as CurvePoolConfig, config);
    case LiquidityPoolKind.Balancer:
      return await verifyBalancerLiquidityDepth(args.midasSdk, args.asset as BalancerPoolConfig, config);
    default:
      return true;
  }
}
