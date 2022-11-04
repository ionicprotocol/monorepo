import { BigNumber } from "ethers";

import { logger } from "../..";
import { PriceChangeVerifierConfig, PriceFeedValidity } from "../../types";

import { AbstractOracleVerifier } from "./base";

export class PriceChangeVerifier extends AbstractOracleVerifier {
  mpoPrice: BigNumber;
  config: PriceChangeVerifierConfig;

  async initMpoPrice(): Promise<PriceChangeVerifier | null> {
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

  async init(): Promise<PriceChangeVerifier | null> {
    return await this.initMpoPrice();
  }

  public async verify(): Promise<PriceFeedValidity> {
    return true;
  }
}
