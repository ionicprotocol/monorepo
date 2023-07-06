import { chainIdToConfig } from "@ionicprotocol/chains";
import { assetFilter, assetSymbols, SupportedChains } from "@ionicprotocol/types";

import { PriceChangeVerifierAsset } from "../../types";

import { lsdPriceChangeDefaults, smallCapPriceChangeDefaults, stablePriceChangeDefaults } from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.moonbeam].assets;

// Smaller Cap
const STELLA = assetFilter(chainAssets, assetSymbols.STELLA);

// LSD
const stDOT = assetFilter(chainAssets, assetSymbols.stDOT);
const wstDOT = assetFilter(chainAssets, assetSymbols.wstDOT);

// Bridged Assets
const multiUSDC = assetFilter(chainAssets, assetSymbols.multiUSDC);
const whUSDC = assetFilter(chainAssets, assetSymbols.USDC_wh);

const assets: PriceChangeVerifierAsset[] = [
  // Small Cap
  {
    ...STELLA,
    ...smallCapPriceChangeDefaults,
  },
  // LSD
  {
    ...stDOT,
    ...lsdPriceChangeDefaults,
  },
  {
    ...wstDOT,
    ...lsdPriceChangeDefaults,
  },
  // Bridged Assets
  {
    ...multiUSDC,
    ...stablePriceChangeDefaults,
  },
  {
    ...whUSDC,
    ...stablePriceChangeDefaults,
  },
];

export default assets;
