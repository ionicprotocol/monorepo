import { assetFilter, assetSymbols, SupportedChains } from "@midas-capital/types";

import { chainIdToConfig, PriceChangeVerifierAsset } from "../../types";

import {
  lsdPriceChangeDefaults,
  midCapPriceChangeDefaults,
  smallCapPriceChangeDefaults,
  stablePriceChangeDefaults,
} from "./defaults";

const chainAssets = chainIdToConfig[SupportedChains.polygon].assets;

// Smaller Cap
const MIMO = assetFilter(chainAssets, assetSymbols.MIMO);
const AAVE = assetFilter(chainAssets, assetSymbols.AAVE);

// LSD
const MATICx = assetFilter(chainAssets, assetSymbols.MATICx);
const stMATIC = assetFilter(chainAssets, assetSymbols.stMATIC);
const aMATICc = assetFilter(chainAssets, assetSymbols.aMATICc);

// Stables
const MAI = assetFilter(chainAssets, assetSymbols.MAI);
const PAR = assetFilter(chainAssets, assetSymbols.PAR);
const agEUR = assetFilter(chainAssets, assetSymbols.AGEUR);
const EURT = assetFilter(chainAssets, assetSymbols.EURT);

const assets: PriceChangeVerifierAsset[] = [
  // Small Cap
  {
    ...MIMO,
    ...smallCapPriceChangeDefaults,
  },
  {
    ...AAVE,
    ...midCapPriceChangeDefaults,
  },
  // LSD
  {
    ...MATICx,
    ...lsdPriceChangeDefaults,
  },
  {
    ...stMATIC,
    ...lsdPriceChangeDefaults,
  },
  {
    ...aMATICc,
    ...lsdPriceChangeDefaults,
  },
  // Stables
  {
    ...MAI,
    ...stablePriceChangeDefaults,
  },
  {
    ...PAR,
    ...stablePriceChangeDefaults,
  },
  {
    ...agEUR,
    ...stablePriceChangeDefaults,
  },
  {
    ...EURT,
    ...stablePriceChangeDefaults,
  },
];

export default assets;
