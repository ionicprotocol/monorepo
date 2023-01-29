import { chainIdToConfig } from "@midas-capital/chains";
import { assetFilter, assetSymbols, SupportedChains } from "@midas-capital/types";

import { PriceVerifierAsset } from "../../types";

import { priceDeviations } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.fantom].assets.filter(
  (asset) => asset.disabled === undefined || asset.disabled == false
);

const assets: PriceVerifierAsset[] = [
  {
    ...assetFilter(chainAssets, assetSymbols.MIMO),
    maxPriceDeviation: priceDeviations.SMALL_CAP,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.aFTMc),
    maxPriceDeviation: priceDeviations.LSD,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.PAR),
    maxPriceDeviation: priceDeviations.STABLE,
  },
];

export default assets;
