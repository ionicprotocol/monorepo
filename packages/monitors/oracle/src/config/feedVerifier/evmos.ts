import { chainIdToConfig } from "@ionicprotocol/chains";
import { OracleTypes, SupportedChains } from "@ionicprotocol/types";

import { FeedVerifierAsset } from "../../types";

import { defaultMaxObservationDelay } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.bsc].assets.filter(
  (asset) => asset.disabled === undefined || asset.disabled == false
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
