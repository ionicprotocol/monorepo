import { BigNumber } from "ethers";

import { logger } from "../..";
import { OracleFailure, PriceChangeVerifierConfig, PriceFeedValidity, VerifierInitValidity } from "../../types";

import { AbstractOracleVerifier } from "./base";

export class PriceChangeVerifier extends AbstractOracleVerifier {
  mpoPrice: BigNumber;
  config: PriceChangeVerifierConfig;

  async initMpoPrice(): Promise<[PriceChangeVerifier, VerifierInitValidity]> {
    try {
      this.mpoPrice = await this.mpo.callStatic.price(this.asset.underlying);
      return [this, null];
    } catch (e) {
      const msg = `Failed to fetch price for ${this.asset.symbol} (${this.asset.underlying})`;
      logger.error(msg + e);
      return [
        this,
        {
          message: msg,
          invalidReason: OracleFailure.MPO_FAILURE,
        },
      ];
    }
  }

  async init(): Promise<[PriceChangeVerifier, VerifierInitValidity]> {
    return await this.initMpoPrice();
  }

  public async verify(): Promise<PriceFeedValidity> {
    return true;
  }
}
