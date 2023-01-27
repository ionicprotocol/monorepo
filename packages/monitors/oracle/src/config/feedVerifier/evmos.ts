import { chainIdToConfig } from "@midas-capital/chains";
import { assetFilter, assetSymbols, OracleTypes, SupportedChains } from "@midas-capital/types";

import { FeedVerifierAsset } from "../../types";

import { defaultDeviationThreshold, defaultMaxObservationDelay } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.bsc].assets.filter(
  (asset) => asset.disabled !== undefined && !asset.disabled
);

const axlUSDC = assetFilter(chainAssets, assetSymbols.axlUSDC);
const ceUSDC = assetFilter(chainAssets, assetSymbols.ceUSDC);
const gWETH = assetFilter(chainAssets, assetSymbols.gWETH);

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

const assets: PriceChangeVerifierAsset[] = [
  // Bridged Assets
  {
    ...axlUSDC,
    ...stablePriceChangeDefaults,
  },
  {
    ...ceUSDC,
    ...stablePriceChangeDefaults,
  },
  {
    ...gWETH,
    ...stablePriceChangeDefaults,
  },
];

export default assets;
