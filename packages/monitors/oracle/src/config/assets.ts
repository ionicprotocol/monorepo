import { chainIdToConfig } from "@midas-capital/chains";
import { assetSymbols, OracleTypes, SupportedAsset } from "@midas-capital/types";

import { Services } from "../types";

import { chainIdToAssets as feedVerifierAssets } from "./feedVerifier";
import { chainIdToAssets as priceChangeVerifierAssets } from "./priceChangeVerifier";
import { baseConfig } from "./variables";

// DIA Feed verification also runs price verification
const PRICE_VERIFIER_ORACLES = [OracleTypes.ChainlinkPriceOracleV2, OracleTypes.UniswapTwapPriceOracleV2];

// Disable forex assets
const PRICE_VERIFICATION_DISABLED = [
  assetSymbols.EURE,
  assetSymbols.EURT,
  assetSymbols.JEUR,
  assetSymbols.JGBP,
  assetSymbols.JJPY,
  assetSymbols.JCHF,
  assetSymbols.JCAD,
  assetSymbols.CADC,
  assetSymbols.NZDS,
  assetSymbols.JNZD,
  assetSymbols.JCNY,
  assetSymbols.JPYC,
  assetSymbols.JSGD,
  assetSymbols.JPHP,
  assetSymbols.JKRW,
  assetSymbols.JSEK,
  assetSymbols.XSGD,
];

const getPriceVerifierAssets = (): SupportedAsset[] => {
  const chainAssets = chainIdToConfig[baseConfig.chainId].assets;
  return chainAssets.filter(
    (asset) =>
      asset.oracle &&
      PRICE_VERIFIER_ORACLES.includes(asset.oracle) &&
      asset.disabled !== true &&
      !PRICE_VERIFICATION_DISABLED.includes(asset.symbol as assetSymbols)
  );
};

const getFeedVerifierAssets = (): SupportedAsset[] => {
  return feedVerifierAssets[baseConfig.chainId];
};
const getPriceChangeVerifierAssets = (): SupportedAsset[] => {
  return priceChangeVerifierAssets[baseConfig.chainId];
};

export const assets = {
  [Services.FeedVerifier]: getFeedVerifierAssets(),
  [Services.PriceVerifier]: getPriceVerifierAssets(),
  [Services.PriceChangeVerifier]: getPriceChangeVerifierAssets(),
};
