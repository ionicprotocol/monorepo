import { SupportedChains } from "@ionicprotocol/types";

import { FeedVerifierAsset } from "../../types";

import { default as bscAssets } from "./bsc";
import { default as polygonAssets } from "./polygon";

export const chainIdToAssets: { [chainId: number]: FeedVerifierAsset[] } = {
  [SupportedChains.bsc]: bscAssets,
  [SupportedChains.polygon]: polygonAssets,
};
