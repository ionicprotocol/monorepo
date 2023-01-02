import { assetFilter, assetSymbols } from "@midas-capital/types";

import { chainIdToConfig, PriceChangeVerifierAsset } from "../../types";
import { baseConfig } from "../variables";

import { lsdPriceChangeDefaults, smallCapPriceChangeDefaults, stablePriceChangeDefaults } from "./defaults";

const chainAssets = chainIdToConfig[baseConfig.chainId].assets;

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
