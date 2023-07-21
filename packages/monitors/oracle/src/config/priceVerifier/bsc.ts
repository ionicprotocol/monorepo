import { chainIdToConfig } from "@ionicprotocol/chains";
import { assetFilter, assetSymbols, SupportedChains } from "@ionicprotocol/types";

import { PriceVerifierAsset } from "../../types";

import { priceDeviations } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.bsc].assets.filter(
  (asset) => asset.disabled === undefined || asset.disabled == false
);

const assets: PriceVerifierAsset[] = [
  {
    ...assetFilter(chainAssets, assetSymbols.stkBNB),
    maxPriceDeviation: priceDeviations.LSD,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.BNBx),
    maxPriceDeviation: priceDeviations.LSD,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.ankrBNB),
    maxPriceDeviation: priceDeviations.LSD,
  },
];

export default assets;
