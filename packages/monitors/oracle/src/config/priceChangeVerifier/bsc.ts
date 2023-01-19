import { chainIdToConfig } from "@midas-capital/chains";
import { assetFilter, assetSymbols, SupportedChains } from "@midas-capital/types";

import { PriceChangeVerifierAsset } from "../../types";

import { lsdPriceChangeDefaults, midCapPriceChangeDefaults, stablePriceChangeDefaults } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.bsc].assets;

// Smaller Cap
const CAKE = assetFilter(chainAssets, assetSymbols.CAKE);

// LSD
const stkBNB = assetFilter(chainAssets, assetSymbols.stkBNB);
const BNBx = assetFilter(chainAssets, assetSymbols.BNBx);
const ankrBNB = assetFilter(chainAssets, assetSymbols.ankrBNB);

// Stables
const MAI = assetFilter(chainAssets, assetSymbols.MAI);
const HAY = assetFilter(chainAssets, assetSymbols.HAY);

const assets: PriceChangeVerifierAsset[] = [
  // Small Cap
  {
    ...CAKE,
    ...midCapPriceChangeDefaults,
  },
  // LSD
  {
    ...stkBNB,
    ...lsdPriceChangeDefaults,
  },
  {
    ...BNBx,
    ...lsdPriceChangeDefaults,
  },
  {
    ...ankrBNB,
    ...lsdPriceChangeDefaults,
  },
  // Stables
  {
    ...HAY,
    ...stablePriceChangeDefaults,
  },
  {
    ...MAI,
    ...stablePriceChangeDefaults,
  },
];

export default assets;
