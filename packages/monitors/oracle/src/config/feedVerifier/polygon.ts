import { chainIdToConfig } from "@ionicprotocol/chains";
import { assetFilter, assetSymbols, OracleTypes, SupportedChains } from "@ionicprotocol/types";

import { FeedVerifierAsset } from "../../types";

import { defaultDeviationThreshold, defaultMaxObservationDelay } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.polygon].assets.filter(
  (asset) => asset.disabled === undefined || asset.disabled == false
);

const chainLinkSupportedAssets = chainAssets.filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2);
const MIMO = assetFilter(chainAssets, assetSymbols.MIMO);

// Dia Assets
const diaAssets: FeedVerifierAsset[] = [
  {
    ...MIMO,
    deviationThreshold: defaultDeviationThreshold,
    maxObservationDelay: defaultMaxObservationDelay,
  },
];

const chainLinkAssets: FeedVerifierAsset[] = chainLinkSupportedAssets.map((asset) => {
  return {
    ...asset,
    deviationThreshold: 0.05,
    maxObservationDelay: defaultMaxObservationDelay,
  };
});

const assets: FeedVerifierAsset[] = [
  // Dia Assets
  ...diaAssets,
  ...chainLinkAssets,
];

export default assets;
