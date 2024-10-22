import { OracleTypes } from "@ionicprotocol/types";

const baseOracles = [
  OracleTypes.FixedNativePriceOracle,
  OracleTypes.MasterPriceOracle,
  OracleTypes.SimplePriceOracle,
  OracleTypes.PythPriceOracle
];

const oracles: OracleTypes[] = [...baseOracles, OracleTypes.ChainlinkPriceOracleV2];

export default oracles;
