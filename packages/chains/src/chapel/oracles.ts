import { OracleTypes } from "@ionicprotocol/types";

const baseOracles = [OracleTypes.FixedNativePriceOracle, OracleTypes.MasterPriceOracle, OracleTypes.SimplePriceOracle];

const oracles: OracleTypes[] = [
  ...baseOracles,
  OracleTypes.ChainlinkPriceOracleV2,
  OracleTypes.UniswapTwapPriceOracleV2
];

export default oracles;