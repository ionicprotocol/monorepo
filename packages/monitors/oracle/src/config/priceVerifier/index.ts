import { SupportedChains } from "@ionicprotocol/types";

import { PriceVerifierAsset } from "../../types";

import { default as bscAssets } from "./bsc";
import { default as polygonAssets } from "./polygon";

export const chainIdToAssets: { [chainId: number]: PriceVerifierAsset[] } = {
  [SupportedChains.bsc]: bscAssets,
  [SupportedChains.polygon]: polygonAssets,
};
