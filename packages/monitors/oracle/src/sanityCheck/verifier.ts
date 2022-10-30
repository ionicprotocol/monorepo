import { MidasSdk } from "@midas-capital/sdk";
import { OracleTypes, SupportedAsset } from "@midas-capital/types";
import { BigNumber, Contract } from "ethers";

import { logger, PriceFeedInvalidity, PriceValueInvalidity } from "../";
import { DiscordAlert } from "../controllers";

import { VerifyFeedParams, verifyPriceValue, verifyProviderFeed } from "./providers";
import { VerifyPriceParams } from "./providers/price";

export class OracleVerifier {
  asset: SupportedAsset;
  sdk: MidasSdk;
  mpo: Contract;
  underlyingOracle: Contract;
  alert: DiscordAlert;
  mpoPrice: BigNumber;

  constructor(midasSdk: MidasSdk, asset: SupportedAsset) {
    this.asset = asset;
    this.sdk = midasSdk;
    this.mpo = midasSdk.createMasterPriceOracle();
    this.alert = new DiscordAlert(asset, midasSdk.chainId);
  }
  public async verify(oracle: OracleTypes): Promise<{
    mpoPrice: BigNumber;
    priceValidity: PriceValueInvalidity | null;
    feedValidity: PriceFeedInvalidity | null;
  } | null> {
    await this.getSetUnderlyingOracle(oracle);
    await this.getSetMpoPrice();
    if (!this.underlyingOracle || !this.mpoPrice) {
      return null;
    }
    const { sdk, asset, mpoPrice, underlyingOracle } = this;

    const feedArgs: VerifyFeedParams = {
      midasSdk: sdk,
      underlyingOracle: underlyingOracle,
      underlying: asset.underlying,
    };

    const priceArgs: VerifyPriceParams = {
      midasSdk: sdk,
      asset,
      mpoPrice,
    };

    const feedValidity = await this.verifyFeedValidity(oracle, feedArgs);
    const priceValidity = await this.verifyFeedPrice(priceArgs);

    return {
      mpoPrice,
      priceValidity,
      feedValidity,
    };
  }

  private async verifyFeedValidity(oracle: OracleTypes, args: VerifyFeedParams) {
    const feedInvalidity = await verifyProviderFeed(oracle, args);
    if (feedInvalidity !== null) {
      await this.alert.sendInvalidFeedAlert(feedInvalidity);
      logger.error(feedInvalidity.message);
    }
    return feedInvalidity;
  }

  private async verifyFeedPrice(args: VerifyPriceParams) {
    const priceValidity = await verifyPriceValue(args);
    if (priceValidity !== null) {
      await this.alert.sendInvalidFeedAlert(priceValidity);
      logger.error(priceValidity.message);
    }
    return priceValidity;
  }

  private async getSetUnderlyingOracle(oracleType: OracleTypes): Promise<Contract | null> {
    try {
      const oracleAddress = await this.mpo.callStatic.oracles(this.asset.underlying);
      const { oracles, provider } = this.sdk;
      this.underlyingOracle = new Contract(oracleAddress, oracles[oracleType].abi, provider);
      return this.underlyingOracle;
    } catch (e) {
      const msg = `No oracle found for asset ${this.asset.symbol} (${this.asset.underlying})`;
      await this.alert.sendMpoFailureAlert(msg);
      logger.error(msg + e);
      return null;
    }
  }
  private async getSetMpoPrice(): Promise<BigNumber | null> {
    try {
      this.mpoPrice = await this.mpo.callStatic.price(this.asset.underlying);
      return this.mpoPrice;
    } catch (e) {
      const msg = `Failed to fetch price for ${this.asset.symbol} (${this.asset.underlying})`;
      await this.alert.sendMpoFailureAlert(msg);
      logger.error(msg + e);
      return null;
    }
  }
}
