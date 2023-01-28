import { chainIdToConfig } from "@midas-capital/chains";
import { assetFilter, assetSymbols, SupportedChains } from "@midas-capital/types";

import { PriceVerifierAsset } from "../../types";

import { priceDeviations } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.moonbeam].assets.filter(
  (asset) => asset.disabled === undefined || asset.disabled == false
);

const assets: PriceVerifierAsset[] = [
  {
    ...assetFilter(chainAssets, assetSymbols.WGLMR),
    maxPriceDeviation: priceDeviations.MID_CAP,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.WBTC_wh),
    maxPriceDeviation: priceDeviations.MID_CAP,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.WETH_wh),
    maxPriceDeviation: priceDeviations.MID_CAP,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.stDOT),
    maxPriceDeviation: priceDeviations.LSD,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.USDC_wh),
    maxPriceDeviation: priceDeviations.STABLE,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.USDT_xc),
    maxPriceDeviation: priceDeviations.STABLE,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.multiDAI),
    maxPriceDeviation: priceDeviations.STABLE,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.multiUSDC),
    maxPriceDeviation: priceDeviations.STABLE,
  },
];

export default assets;
