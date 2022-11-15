import { OracleTypes } from "@midas-capital/types";

const baseOracles = [OracleTypes.FixedNativePriceOracle, OracleTypes.MasterPriceOracle, OracleTypes.SimplePriceOracle];

const oracles: OracleTypes[] = [
  ...baseOracles,
  OracleTypes.ChainlinkPriceOracleV2,
  OracleTypes.CurveLpTokenPriceOracleNoRegistry,
  OracleTypes.CurveV2LpTokenPriceOracleNoRegistry,
  OracleTypes.UniswapLpTokenPriceOracle,
  OracleTypes.UniswapTwapPriceOracleV2,
  OracleTypes.StkBNBPriceOracle,
  OracleTypes.AnkrCertificateTokenPriceOracle,
  OracleTypes.BNBxPriceOracle,
  OracleTypes.DiaPriceOracle,
];
export default oracles;
