import { chainIdToConfig } from "@midas-capital/chains";
import { assetFilter, assetSymbols, OracleTypes, SupportedChains } from "@midas-capital/types";

import { FeedVerifierAsset } from "../../types";

import { defaultDeviationThreshold, defaultMaxObservationDelay } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.bsc].assets.filter(
  (asset) => asset.disabled !== undefined && !asset.disabled
);

const MAI = assetFilter(chainAssets, assetSymbols.MAI);
const HAY = assetFilter(chainAssets, assetSymbols.HAY);
const chainLinkSupportedAssets = chainAssets.filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2);

// Dia Assets
const diaAssets: FeedVerifierAsset[] = [
  {
    ...MAI,
    deviationThreshold: defaultDeviationThreshold,
    maxObservationDelay: defaultMaxObservationDelay,
  },
];

const uniswapV2Assets: FeedVerifierAsset[] = [
  {
    ...HAY,
    deviationThreshold: 0.01,
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
  ...uniswapV2Assets,
  ...chainLinkAssets,
];

export default assets;
