import { chainIdToConfig } from "@midas-capital/chains";
import { assetFilter, assetSymbols, OracleTypes, SupportedChains } from "@midas-capital/types";

import { FeedVerifierAsset } from "../../types";

import { defaultDeviationThreshold, defaultMaxObservationDelay } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.bsc].assets.filter(
  (asset) => asset.disabled !== undefined && !asset.disabled
);

const fluxSupportedAssets = chainAssets.filter((asset) => asset.oracle === OracleTypes.FluxPriceOracle);

const fluxAssets: FeedVerifierAsset[] = fluxSupportedAssets.map((asset) => {
  return {
    ...asset,
    deviationThreshold: 0.05,
    maxObservationDelay: defaultMaxObservationDelay,
  };
});

const assets: FeedVerifierAsset[] = [...fluxAssets];

export default assets;
