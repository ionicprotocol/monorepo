import { BigNumber, utils } from "ethers";

import { logger } from "../../..";
import { getAssetPriceCacheData } from "../../../controllers";
import { insertAssetPriceCacheData } from "../../../controllers/assetPriceCache";
import {
  AssetPriceCache,
  OracleFailure,
  OraclePriceVerifierFailure,
  PriceChangeKind,
  PriceChangeVerifierAsset,
  PriceChangeVerifierConfig,
  PriceFeedValidity,
  VerifierInitValidity,
} from "../../../types";
import { AbstractOracleVerifier } from "../base";

import { calculateDelta, deltaWithinRange, observationUpdatable, updateCache } from "./utils";

export class PriceChangeVerifier extends AbstractOracleVerifier {
  mpoPrice: BigNumber;
  config: PriceChangeVerifierConfig;
  asset: PriceChangeVerifierAsset;
  assetInitValues: Omit<AssetPriceCache, "first_observation_deviation" | "second_observation_deviation">;

  async initMpoPrice(): Promise<[PriceChangeVerifier, VerifierInitValidity]> {
    try {
      this.mpoPrice = await this.mpo.callStatic.price(this.asset.underlying);
      this.assetInitValues = {
        asset_address: this.asset.underlying,
        markets_paused: false,
        first_observation_ts: new Date().toISOString(),
        second_observation_ts: new Date().toISOString(),
        first_observation_value_ether: parseFloat(utils.formatEther(this.mpoPrice)),
        second_observation_value_ether: parseFloat(utils.formatEther(this.mpoPrice)),
      };
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

  public async verifyObservation(kind: PriceChangeKind, assetPriceCache: AssetPriceCache): Promise<PriceFeedValidity> {
    const { asset, mpoPrice, config } = this;
    const updatable = await observationUpdatable(kind, assetPriceCache, config);
    if (updatable) {
      logger.debug(`${kind} observation for ${asset.symbol} (${asset.underlying}) needs updated`);

      const delta = calculateDelta(kind, assetPriceCache, mpoPrice);
      await updateCache(kind, assetPriceCache, delta, mpoPrice);
      const valid = deltaWithinRange(kind, delta, asset);

      if (!valid) {
        return {
          invalidReason: OraclePriceVerifierFailure.SHORT_PRICE_DEVIATION_ABOVE_THRESHOLD,
          message: `Price change for ${asset.symbol} (${asset.underlying}) in the last ${PriceChangeKind.SHORT} seconds is too high: ${delta}%`,
        };
      }
    }
    return true;
  }

  public async verify(): Promise<PriceFeedValidity> {
    const { asset } = this;
    const [assetPriceCache, error] = await getAssetPriceCacheData(asset.underlying);
    if (error !== null) {
      return {
        invalidReason: OraclePriceVerifierFailure.CACHE_FAILURE,
        message: error.message,
      };
    }
    // No error, but no cache data
    if (assetPriceCache === null) {
      await insertAssetPriceCacheData(this.assetInitValues);
      return true;
    }
    return (
      (await this.verifyObservation(PriceChangeKind.LONG, assetPriceCache)) &&
      (await this.verifyObservation(PriceChangeKind.SHORT, assetPriceCache))
    );
  }
}
