import { chainIdToConfig } from "@ionicprotocol/chains";
import { assetFilter, assetSymbols, SupportedChains } from "@ionicprotocol/types";

import { PriceChangeVerifierAsset } from "../../types";

import { lsdPriceChangeDefaults, stablePriceChangeDefaults } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.bsc].assets;

// LSD
const stkBNB = assetFilter(chainAssets, assetSymbols.stkBNB);
const BNBx = assetFilter(chainAssets, assetSymbols.BNBx);
const ankrBNB = assetFilter(chainAssets, assetSymbols.ankrBNB);

// Stables
const MAI = assetFilter(chainAssets, assetSymbols.MAI);

const assets: PriceChangeVerifierAsset[] = [
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
    ...MAI,
    ...stablePriceChangeDefaults,
  },
];

export default assets;
