import { chainlinkPriceOracleV2Abi, diaPriceOracleAbi, uniswapTwapPriceOracleV2Abi } from "@ionicprotocol/sdk";
import { OracleTypes } from "@ionicprotocol/types";
import { getContract, GetContractReturnType, PublicClient } from "viem";

import { logger } from "../../../logger";
import {
  FeedVerifierAsset,
  FeedVerifierConfig,
  OracleFailure,
  PriceFeedValidity,
  VerifierInitValidity,
  VerifyFeedParams,
} from "../../../types";
import { AbstractOracleVerifier } from "../base";

import { verifyProviderFeed } from "./providers";

export class FeedVerifier extends AbstractOracleVerifier {
  underlyingOracle: GetContractReturnType<
    typeof chainlinkPriceOracleV2Abi | typeof diaPriceOracleAbi | typeof uniswapTwapPriceOracleV2Abi,
    PublicClient
  >;
  config: FeedVerifierConfig;
  asset: FeedVerifierAsset;

  async initUnderlyingOracle(): Promise<[FeedVerifier, VerifierInitValidity]> {
    if (!this.asset.oracle) {
      const msg = `Asset: ${this.asset.symbol} (${this.asset.underlying}) does not have a price oracle set, considering setting "disabled: true"`;
      logger.error(msg);
      return [this, { message: msg, invalidReason: OracleFailure.NO_ORACLE_FOUND }];
    }
    this.oracleType = this.asset.oracle;

    try {
      const oracleAddress = await this.mpo.read.oracles([this.asset.underlying]);
      const { publicClient } = this.sdk;
      switch (this.oracleType) {
        case OracleTypes.ChainlinkPriceOracleV2:
          this.underlyingOracle = getContract({
            address: oracleAddress,
            abi: chainlinkPriceOracleV2Abi,
            client: publicClient,
          }) as any;
          break;
        case OracleTypes.DiaPriceOracle:
          this.underlyingOracle = getContract({
            address: oracleAddress,
            abi: diaPriceOracleAbi,
            client: publicClient,
          }) as any;
          break;
        case OracleTypes.UniswapTwapPriceOracleV2:
          this.underlyingOracle = getContract({
            address: oracleAddress,
            abi: uniswapTwapPriceOracleV2Abi,
            client: publicClient,
          }) as any;
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
      ionicSdk: sdk,
      underlyingOracle: underlyingOracle as any,
      asset,
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
