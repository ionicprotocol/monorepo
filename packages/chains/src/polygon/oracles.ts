import { OracleTypes } from "@ionicprotocol/types";

const baseOracles = [OracleTypes.FixedNativePriceOracle, OracleTypes.MasterPriceOracle, OracleTypes.SimplePriceOracle];

const oracles: OracleTypes[] = [
  ...baseOracles,
  OracleTypes.ChainlinkPriceOracleV2,
  OracleTypes.DiaPriceOracle,
  OracleTypes.CurveLpTokenPriceOracleNoRegistry,
  OracleTypes.UniswapLpTokenPriceOracle,
  OracleTypes.GelatoGUniPriceOracle,
  OracleTypes.BalancerLpTokenPriceOracle,
  OracleTypes.BalancerLpStablePoolPriceOracle,
  OracleTypes.BalancerRateProviderOracle,
  OracleTypes.AlgebraPriceOracle,
  OracleTypes.GammaPoolUniswapV3PriceOracle,
  OracleTypes.UniswapV3PriceOracle
];

export default oracles;
