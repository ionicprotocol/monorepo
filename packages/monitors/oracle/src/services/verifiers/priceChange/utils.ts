import { BigNumber, utils } from "ethers";

import { updateAssetPriceCacheData } from "../../../controllers";
import { AssetPriceCache, PriceChangeKind, PriceChangeVerifierAsset, PriceChangeVerifierConfig } from "../../../types";

export async function observationUpdatable(
  kind: PriceChangeKind,
  assetPriceCache: AssetPriceCache,
  config: PriceChangeVerifierConfig
) {
  const currentTs = Date.now();

  const { first_observation_ts, second_observation_ts } = assetPriceCache;
  const observation = kind === PriceChangeKind.SHORT ? first_observation_ts : second_observation_ts;
  return currentTs - new Date(observation).getTime() > config.priceDeviationPeriods[kind];
}

export function calculateDelta(kind: PriceChangeKind, assetPriceCache: AssetPriceCache, mpoPrice: BigNumber): number {
  const observationValue =
    kind === PriceChangeKind.SHORT
      ? assetPriceCache.first_observation_value_ether
      : assetPriceCache.second_observation_value_ether;
  const mpoPriceFloat = parseFloat(utils.formatEther(mpoPrice));
  return ((mpoPriceFloat - observationValue) * 100) / observationValue;
}

export function deltaWithinRange(kind: PriceChangeKind, delta: number, asset: PriceChangeVerifierAsset): boolean {
  const deviationThreshold = asset.priceDeviationThresholds;
  return deviationThreshold[kind] > Math.abs(delta);
}

export async function updateCache(
  kind: PriceChangeKind,
  assetPriceCache: AssetPriceCache,
  delta: number,
  mpoPrice: BigNumber
) {
  if (kind === PriceChangeKind.SHORT) {
    const values = {
      ...assetPriceCache,
      first_observation_ts: new Date().toISOString(),
      first_observation_value_ether: parseFloat(utils.formatEther(mpoPrice)),
      first_observation_deviation: delta,
    };
    await updateAssetPriceCacheData(values);
  } else {
    const values = {
      ...assetPriceCache,
      second_observation_ts: new Date().toISOString(),
      second_observation_value_ether: parseFloat(utils.formatEther(mpoPrice)),
      second_observation_deviation: delta,
    };
    await updateAssetPriceCacheData(values);
  }
}
