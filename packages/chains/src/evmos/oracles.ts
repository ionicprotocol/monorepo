import { OracleTypes } from "@midas-capital/types";

const baseOracles = [OracleTypes.FixedNativePriceOracle, OracleTypes.MasterPriceOracle, OracleTypes.SimplePriceOracle];

const oracles: OracleTypes[] = [
  ...baseOracles,
  OracleTypes.UniswapLpTokenPriceOracle,
  OracleTypes.UniswapTwapPriceOracleV2,
  OracleTypes.AdrastiaPriceOracle,
  OracleTypes.FluxPriceOracle,
  OracleTypes.NativeUSDPriceOracle,
  OracleTypes.SaddleLpTokenPriceOracle,
];

export default oracles;
