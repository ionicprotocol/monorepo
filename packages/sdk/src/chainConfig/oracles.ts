import { ChainOracles } from "../types";
import { OracleTypes, SupportedChains } from "../enums";

const oracles: ChainOracles = {
  [SupportedChains.ganache]: [
    OracleTypes.SimplePriceOracle,
    OracleTypes.MasterPriceOracle,
  ],
  [SupportedChains.chapel]: [
    OracleTypes.MasterPriceOracle,
    OracleTypes.ChainlinkPriceOracleV2,
    OracleTypes.UniswapTwapPriceOracleV2,
  ],
  [SupportedChains.bsc]: [
    OracleTypes.MasterPriceOracle,
    OracleTypes.ChainlinkPriceOracleV2,
    OracleTypes.UniswapTwapPriceOracleV2,
    OracleTypes.SimplePriceOracle,
  ],
  // TODO: not sure if this is correct
  [SupportedChains.evmos_testnet]: [OracleTypes.MasterPriceOracle],
  [SupportedChains.evmos]: [OracleTypes.MasterPriceOracle],
  [SupportedChains.aurora]: [OracleTypes.MasterPriceOracle],
  [SupportedChains.moonbeam]: [OracleTypes.MasterPriceOracle],
  [SupportedChains.moonbase_alpha]: [OracleTypes.MasterPriceOracle],
};

export default oracles;
