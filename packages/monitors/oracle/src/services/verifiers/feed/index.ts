import { OracleTypes } from "@midas-capital/types";
import { Contract } from "ethers";

import { logger } from "../../../logger";
import {
  FeedVerifierConfig,
  OracleFailure,
  PriceFeedValidity,
  VerifierInitValidity,
  VerifyFeedParams,
} from "../../../types";
import { AbstractOracleVerifier } from "../base";

import { verifyProviderFeed } from "./providers";
import ChainlinkPriceOracleV2ABI from "@midas-capital/sdk/abis/ChainlinkPriceOracleV2";
import DiaPriceOracleABI from "@midas-capital/sdk/abis/DiaPriceOracle";
import FluxPriceOracleABI from "@midas-capital/sdk/abis/FluxPriceOracle";
import UniswapTwapPriceOracleV2ABI from "@midas-capital/sdk/abis/UniswapTwapPriceOracleV2";

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
      const { chainDeployment, provider } = this.sdk;
      switch (this.oracleType) {
        case OracleTypes.ChainlinkPriceOracleV2:
          this.underlyingOracle = new Contract(oracleAddress, ChainlinkPriceOracleV2ABI, provider);
          break;
        case OracleTypes.DiaPriceOracle:
          this.underlyingOracle = new Contract(oracleAddress, DiaPriceOracleABI, provider);
          break;
        case OracleTypes.FluxPriceOracle:
          this.underlyingOracle = new Contract(oracleAddress, FluxPriceOracleABI, provider);
          break;
        case OracleTypes.UniswapTwapPriceOracleV2:
          this.underlyingOracle = new Contract(oracleAddress, UniswapTwapPriceOracleV2ABI, provider);
          break;
        default:
          throw new Error(`Oracle type ${this.oracleType} not supported`);
      }

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
