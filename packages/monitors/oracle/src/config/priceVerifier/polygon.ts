import { chainIdToConfig } from "@midas-capital/chains";
import { assetFilter, assetSymbols, SupportedChains } from "@midas-capital/types";

import { PriceVerifierAsset } from "../../types";

import { priceDeviations } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.polygon].assets.filter(
  (asset) => asset.disabled === undefined || asset.disabled == false
);

const assets: PriceVerifierAsset[] = [
  {
    ...assetFilter(chainAssets, assetSymbols.MIMO),
    maxPriceDeviation: priceDeviations.SMALL_CAP,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.MAI),
    maxPriceDeviation: 1,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.MATICx),
    maxPriceDeviation: priceDeviations.LSD,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.stMATIC),
    maxPriceDeviation: priceDeviations.LSD,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.aMATICc),
    maxPriceDeviation: priceDeviations.LSD,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.PAR),
    maxPriceDeviation: 3,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.JEUR),
    maxPriceDeviation: priceDeviations.STABLE,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.JGBP),
    maxPriceDeviation: priceDeviations.STABLE,
  },
];

export default assets;
