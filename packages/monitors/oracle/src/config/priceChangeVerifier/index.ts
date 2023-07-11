import { SupportedChains } from "@ionicprotocol/types";

import { PriceChangeVerifierAsset } from "../../types";

import { default as bscAssets } from "./bsc";
import { default as polygonAssets } from "./polygon";

export const chainIdToAssets: { [chainId: number]: PriceChangeVerifierAsset[] } = {
  [SupportedChains.bsc]: bscAssets,
  [SupportedChains.polygon]: polygonAssets,
};
