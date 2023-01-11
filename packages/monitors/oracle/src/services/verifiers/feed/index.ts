import { OracleTypes } from "@midas-capital/types";
import { Contract } from "ethers";

import { logger } from "../../..";
import {
  FeedVerifierConfig,
  OracleFailure,
  PriceFeedValidity,
  VerifierInitValidity,
  VerifyFeedParams,
} from "../../../types";
import { AbstractOracleVerifier } from "../base";

import { verifyProviderFeed } from "./providers";

export class FeedVerifier extends AbstractOracleVerifier {
  underlyingOracle: Contract;
  config: FeedVerifierConfig;

  async initUnderlyingOracle(): Promise<[FeedVerifier, VerifierInitValidity]> {
    if (!this.asset.oracle) {
      const msg = `Asset: ${this.asset.symbol} (${this.asset.underlying}) does not have a price oracle set, considering setting "disabled: true"`;
      logger.error(msg);
      return [this, { message: msg, invalidReason: OracleFailure.NO_ORACLE_FOUND }];
    }
    this.oracleType = this.asset.oracle;

    try {
      const oracleAddress = await this.mpo.callStatic.oracles(this.asset.underlying);
      const { oracles, provider } = this.sdk;
      this.underlyingOracle = new Contract(oracleAddress, oracles[this.oracleType].abi, provider);
      return [this, null];
    } catch (e) {
      const msg = `No oracle found for asset ${this.asset.symbol} (${this.asset.underlying})`;
      logger.error(msg + e);
      return [this, { message: msg, invalidReason: OracleFailure.NO_ORACLE_FOUND }];
    }
  }
  async init(): Promise<[FeedVerifier, VerifierInitValidity]> {
    return await this.initUnderlyingOracle();
  }

  public async verify(): Promise<PriceFeedValidity> {
    const { sdk, asset, underlyingOracle } = this;
    const feedArgs: VerifyFeedParams = {
      midasSdk: sdk,
      underlyingOracle: underlyingOracle,
      underlying: asset.underlying,
    };
    return await this.verifyFeedValidity(this.oracleType, feedArgs);
  }

  private async verifyFeedValidity(oracle: OracleTypes, args: VerifyFeedParams) {
    const feedInvalidity = await verifyProviderFeed(oracle, this.config, args);
    if (feedInvalidity !== true) {
      logger.error(feedInvalidity.message);
    }
    return feedInvalidity;
  }
}
