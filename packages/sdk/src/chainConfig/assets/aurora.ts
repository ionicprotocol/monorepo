import { OracleTypes } from "../../enums";
import { SupportedAsset } from "../../types";

import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WNEAR,
    underlying: "0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d",
    name: "Wrapped NEAR ",
    decimals: 24,
    oracle: OracleTypes.FixedNativePriceOracle,
  },
];

export default assets;
