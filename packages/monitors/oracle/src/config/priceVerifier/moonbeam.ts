import { chainIdToConfig } from "@ionicprotocol/chains";
import { assetFilter, assetSymbols, SupportedChains } from "@ionicprotocol/types";

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
    maxPriceDeviation: 1,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.USDT_xc),
    maxPriceDeviation: 1,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.multiDAI),
    maxPriceDeviation: 1,
  },
  {
    ...assetFilter(chainAssets, assetSymbols.multiUSDC),
    maxPriceDeviation: priceDeviations.STABLE,
  },
];

export default assets;
