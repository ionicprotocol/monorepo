import { chainIdToConfig } from "@midas-capital/chains";
import { assetFilter, assetSymbols, SupportedChains } from "@midas-capital/types";

import { PriceVerifierAsset } from "../../types";

import { priceDeviations } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.bsc].assets.filter(
  (asset) => asset.disabled === undefined || asset.disabled == false
);

const assets: PriceVerifierAsset[] = [
  {
    ...assetFilter(chainAssets, assetSymbols.HAY),
    maxPriceDeviation: 2,
  },
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
  // {
  //   ...assetFilter(chainAssets, assetSymbols.BRZ),
  //   maxPriceDeviation: priceDeviations.STABLE,
  // },
  // {
  //   ...assetFilter(chainAssets, assetSymbols.jBRL),
  //   maxPriceDeviation: priceDeviations.STABLE,
  // },
  {
    ...assetFilter(chainAssets, assetSymbols.JCHF),
    maxPriceDeviation: priceDeviations.STABLE,
  },
];

export default assets;
