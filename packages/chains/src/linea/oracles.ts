import { OracleTypes } from "@ionicprotocol/types";

const baseOracles = [OracleTypes.FixedNativePriceOracle, OracleTypes.MasterPriceOracle, OracleTypes.SimplePriceOracle];

const oracles: OracleTypes[] = [...baseOracles, OracleTypes.KyberSwapPriceOracle];

export default oracles;
