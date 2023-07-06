import { chainIdToConfig } from "@ionicprotocol/chains";
import { assetFilter, assetSymbols, SupportedChains } from "@ionicprotocol/types";

import { PriceChangeVerifierAsset } from "../../types";

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
];

export default assets;
