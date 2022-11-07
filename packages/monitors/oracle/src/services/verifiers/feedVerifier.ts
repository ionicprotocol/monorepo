import { OracleTypes } from "@midas-capital/types";
import { Contract } from "ethers";

import { logger } from "../..";
import { FeedVerifierConfig, PriceFeedValidity, VerifyFeedParams } from "../../types";

import { AbstractOracleVerifier } from "./base";
import { verifyProviderFeed } from "./providers";

export class FeedVerifier extends AbstractOracleVerifier {
  underlyingOracle: Contract;
  config: FeedVerifierConfig;

  async initUnderlyingOracle(): Promise<FeedVerifier | null> {
    if (!this.asset.oracle) {
      logger.error(
        `Asset: ${this.asset.symbol} (${this.asset.underlying}) does not have a price oracle set, considering setting "disabled: true"`
      );
      return null;
    }
    this.oracleType = this.asset.oracle;

    try {
      const oracleAddress = await this.mpo.callStatic.oracles(this.asset.underlying);
      const { oracles, provider } = this.sdk;
      this.underlyingOracle = new Contract(oracleAddress, oracles[this.oracleType].abi, provider);
      return this;
    } catch (e) {
      const msg = `No oracle found for asset ${this.asset.symbol} (${this.asset.underlying})`;
      await this.alert.sendMpoFailureAlert(msg);
      logger.error(msg + e);
      return null;
    }
  }
  async init(): Promise<FeedVerifier | null> {
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
      await this.alert.sendInvalidFeedAlert(feedInvalidity);
      logger.error(feedInvalidity.message);
    }
    return feedInvalidity;
  }
}
