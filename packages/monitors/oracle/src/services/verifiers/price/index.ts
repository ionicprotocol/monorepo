import { BigNumber } from "ethers";

import { logger } from "../../../logger";
import {
  OracleFailure,
  PriceFeedValidity,
  PriceVerifierAsset,
  PriceVerifierConfig,
  VerifierInitValidity,
  VerifyPriceParams,
} from "../../../types";
import { AbstractOracleVerifier } from "../base";
import { verifyPriceValue } from "../feed/providers";

export class PriceVerifier extends AbstractOracleVerifier {
  mpoPrice: BigNumber;
  config: PriceVerifierConfig;
  asset: PriceVerifierAsset;

  async initMpoPrice(): Promise<[PriceVerifier, VerifierInitValidity]> {
    try {
      this.mpoPrice = await this.mpo.callStatic.price(this.asset.underlying);
      return [this, null];
    } catch (e) {
      const msg = `Failed to fetch price for ${this.asset.symbol} (${this.asset.underlying})`;
      logger.error(msg + e);
      return [this, { message: msg, invalidReason: OracleFailure.MPO_FAILURE }];
    }
  }

  async init(): Promise<[PriceVerifier, VerifierInitValidity]> {
    return await this.initMpoPrice();
  }

  public async verify(): Promise<PriceFeedValidity> {
    const { sdk, asset, mpoPrice } = this;

    const priceArgs: VerifyPriceParams = {
      ionicSdk: sdk,
      asset,
      mpoPrice,
    };

    return await this.verifyFeedPrice(priceArgs);
  }

  private async verifyFeedPrice(args: VerifyPriceParams) {
    const priceValidity = await verifyPriceValue(args);
    if (priceValidity !== true) {
      logger.error(priceValidity.message);
    }
    return priceValidity;
  }
}
