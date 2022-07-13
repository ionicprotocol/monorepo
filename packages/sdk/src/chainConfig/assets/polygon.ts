import { OracleTypes } from "../../enums";
import { SupportedAsset } from "../../types";

import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WMATIC,
    underlying: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    name: "Wrapped POLYGON",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
];

export default assets;
