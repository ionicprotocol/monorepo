import { OracleTypes, SupportedAsset } from "@midas-capital/types";

import { chainIdToConfig, Services } from "../types";

import { baseConfig } from "./variables";

const FEED_VERIFIER_ORACLES = [
  OracleTypes.ChainlinkPriceOracleV2,
  OracleTypes.UniswapTwapPriceOracleV2,
  OracleTypes.DiaPriceOracle,
];

// DIA Feed verification also runs price verification
const PRICE_VERIFIER_ORACLES = [OracleTypes.ChainlinkPriceOracleV2, OracleTypes.UniswapTwapPriceOracleV2];

const getFeedVerifierAssets = (): SupportedAsset[] => {
  const chainAssets = chainIdToConfig[baseConfig.chainId].assets;
  return chainAssets.filter(
    (asset) => asset.oracle && FEED_VERIFIER_ORACLES.includes(asset.oracle) && asset.disabled === (false || undefined)
  );
};

const getPriceVerifierAssets = (): SupportedAsset[] => {
  const chainAssets = chainIdToConfig[baseConfig.chainId].assets;
  return chainAssets.filter(
    (asset) => asset.oracle && PRICE_VERIFIER_ORACLES.includes(asset.oracle) && asset.disabled === (false || undefined)
  );
};

const getPriceChangeVerifierAssets = (): SupportedAsset[] => {
  const chainAssets = chainIdToConfig[baseConfig.chainId].assets;
  return chainAssets.filter(
    (asset) => asset.oracle && FEED_VERIFIER_ORACLES.includes(asset.oracle) && asset.disabled === (false || undefined)
  );
};

export const assets = {
  [Services.FeedVerifier]: getFeedVerifierAssets().filter((asset) => asset.symbol === "MAI"),
  [Services.PriceVerifier]: getPriceVerifierAssets(),
  [Services.PriceChangeVerifier]: getPriceChangeVerifierAssets(),
};
