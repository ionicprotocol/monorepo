import { OracleTypes } from "@ionicprotocol/types";

const baseOracles = [OracleTypes.FixedNativePriceOracle, OracleTypes.MasterPriceOracle, OracleTypes.SimplePriceOracle];

const oracles: OracleTypes[] = [...baseOracles, OracleTypes.PythPriceOracle, OracleTypes.AlgebraPriceOracle];

export default oracles;
