import { chainIdToConfig } from "@midas-capital/chains";
import { assetFilter, assetSymbols, OracleTypes, SupportedChains } from "@midas-capital/types";

import { FeedVerifierAsset } from "../../types";

import { defaultDeviationThreshold, defaultMaxObservationDelay } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.moonbeam].assets.filter(
  (asset) => asset.disabled === undefined || asset.disabled == false
);

const multiDAI = assetFilter(chainAssets, assetSymbols.multiDAI);
const multiUSDT = assetFilter(chainAssets, assetSymbols.multiUSDT);
const USDT_xc = assetFilter(chainAssets, assetSymbols.USDT_xc);
const STELLA = assetFilter(chainAssets, assetSymbols.STELLA);

const chainLinkSupportedAssets = chainAssets.filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2);

// Dia Assets
const diaAssets: FeedVerifierAsset[] = [
  {
    ...multiDAI,
    deviationThreshold: defaultDeviationThreshold,
    maxObservationDelay: defaultMaxObservationDelay,
  },
  {
    ...multiUSDT,
    deviationThreshold: defaultDeviationThreshold,
    maxObservationDelay: defaultMaxObservationDelay,
  },
  {
    ...USDT_xc,
    deviationThreshold: defaultDeviationThreshold,
    maxObservationDelay: defaultMaxObservationDelay,
  },
];

const uniswapV2Assets: FeedVerifierAsset[] = [
  {
    ...STELLA,
    deviationThreshold: defaultDeviationThreshold,
    maxObservationDelay: defaultMaxObservationDelay,
  },
];

const chainLinkAssets: FeedVerifierAsset[] = chainLinkSupportedAssets.map((asset) => {
  return {
    ...asset,
    deviationThreshold: defaultDeviationThreshold,
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
