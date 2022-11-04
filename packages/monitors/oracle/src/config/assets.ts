import { OracleTypes, SupportedAsset } from "@midas-capital/types";

import { chainIdToConfig, Services } from "../types";

import { baseConfig } from "./variables";

const FEED_VERIFIER_ORACLES = [
  OracleTypes.ChainlinkPriceOracleV2,
  OracleTypes.UniswapTwapPriceOracleV2,
  OracleTypes.DiaPriceOracle,
];

const getFeedVerifierAssets = (): SupportedAsset[] => {
  const chainAssets = chainIdToConfig[baseConfig.chainId].assets;
  return chainAssets.filter((asset) => asset.oracle && FEED_VERIFIER_ORACLES.includes(asset.oracle));
};

const getPriceVerifierAssets = (): SupportedAsset[] => {
  const chainAssets = chainIdToConfig[baseConfig.chainId].assets;
  return chainAssets.filter((asset) => asset.oracle && FEED_VERIFIER_ORACLES.includes(asset.oracle));
};

const getPriceChangeVerifierAssets = (): SupportedAsset[] => {
  const chainAssets = chainIdToConfig[baseConfig.chainId].assets;
  return chainAssets.filter((asset) => asset.oracle && FEED_VERIFIER_ORACLES.includes(asset.oracle));
};

export const assets = {
  [Services.FeedVerifier]: getFeedVerifierAssets().slice(0, 1),
  [Services.PriceVerifier]: getPriceVerifierAssets().slice(0, 1),
  [Services.PriceChangeVerifier]: getPriceChangeVerifierAssets().slice(0, 1),
};
