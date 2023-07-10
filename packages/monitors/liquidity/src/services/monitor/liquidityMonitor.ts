import { logger } from "../..";
import {
  LiquidityDepthConfig,
  LiquidityPoolKind,
  LiquidityValidity,
  VerifierInitValidity,
  VerifyLiquidityParams,
} from "../../types";
import { verifyAMMLiquidity } from "../pools";

import { AbstractLiquidityVerifier } from "./base";

export class AMMLiquidityVerifier extends AbstractLiquidityVerifier {
  config: LiquidityDepthConfig;

  async init(): Promise<[AMMLiquidityVerifier, VerifierInitValidity]> {
    return [this, null];
  }

  public async verify(poolKind: LiquidityPoolKind): Promise<LiquidityValidity> {
    const { sdk, asset } = this;

    const priceArgs: VerifyLiquidityParams = {
      ionicSdk: sdk,
      asset,
      poolKind,
    };

    return await this.verifyAMMLiquidity(priceArgs);
  }

  private async verifyAMMLiquidity(args: VerifyLiquidityParams) {
    const ammValidity = await verifyAMMLiquidity(this.config, args);
    if (ammValidity !== true) {
      logger.error(ammValidity.message);
    }
    return ammValidity;
  }
}
