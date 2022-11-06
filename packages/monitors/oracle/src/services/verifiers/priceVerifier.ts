import { BigNumber } from "ethers";

import { logger } from "../..";
import { PriceFeedValidity, PriceVerifierConfig, VerifyPriceParams } from "../../types";

import { AbstractOracleVerifier } from "./base";
import { verifyPriceValue } from "./providers";

export class PriceVerifier extends AbstractOracleVerifier {
  mpoPrice: BigNumber;
  config: PriceVerifierConfig;

  async initMpoPrice(): Promise<PriceVerifier | null> {
    try {
      this.mpoPrice = await this.mpo.callStatic.price(this.asset.underlying);
      return this;
    } catch (e) {
      const msg = `Failed to fetch price for ${this.asset.symbol} (${this.asset.underlying})`;
      await this.alert.sendMpoFailureAlert(msg);
      logger.error(msg + e);
      return null;
    }
  }

  async init(): Promise<PriceVerifier | null> {
    return await this.initMpoPrice();
  }

  public async verify(): Promise<PriceFeedValidity> {
    const { sdk, asset, mpoPrice } = this;

    const priceArgs: VerifyPriceParams = {
      midasSdk: sdk,
      asset,
      mpoPrice,
    };

    return await this.verifyFeedPrice(priceArgs);
  }

  private async verifyFeedPrice(args: VerifyPriceParams) {
    const priceValidity = await verifyPriceValue(args, this.config);
    if (priceValidity !== true) {
      await this.alert.sendInvalidFeedAlert(priceValidity);
      logger.error(priceValidity.message);
    }
    return priceValidity;
  }
}
