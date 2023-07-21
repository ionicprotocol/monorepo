import { SupportedAsset } from "@ionicprotocol/types";

import { Services } from "../types";

import { chainIdToAssets as feedVerifierAssets } from "./feedVerifier";
import { chainIdToAssets as priceChangeVerifierAssets } from "./priceChangeVerifier";
import { chainIdToAssets as priceVerifierAssets } from "./priceVerifier";
import { baseConfig } from "./variables";

const getPriceVerifierAssets = (): SupportedAsset[] => {
  return priceVerifierAssets[baseConfig.chainId];
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
