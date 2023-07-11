import { chainIdToConfig } from "@ionicprotocol/chains";
import { OracleTypes, SupportedChains } from "@ionicprotocol/types";

import { FeedVerifierAsset } from "../../types";

import { defaultMaxObservationDelay } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.bsc].assets.filter(
  (asset) => asset.disabled === undefined || asset.disabled == false
);

const chainLinkSupportedAssets = chainAssets.filter((asset) => asset.oracle === OracleTypes.ChainlinkPriceOracleV2);

const uniswapV2Assets: FeedVerifierAsset[] = [];

const chainLinkAssets: FeedVerifierAsset[] = chainLinkSupportedAssets.map((asset) => {
  return {
    ...asset,
    deviationThreshold: 0.05,
    maxObservationDelay: defaultMaxObservationDelay,
  };
});

const assets: FeedVerifierAsset[] = [...uniswapV2Assets, ...chainLinkAssets];

export default assets;
