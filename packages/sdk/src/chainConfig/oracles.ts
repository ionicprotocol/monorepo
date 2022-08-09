import { ChainOracles, OracleTypes, SupportedChains } from "@midas-capital/types";

const baseOracles = [OracleTypes.FixedNativePriceOracle, OracleTypes.MasterPriceOracle, OracleTypes.SimplePriceOracle];

const oracles: ChainOracles = {
  [SupportedChains.ganache]: [...baseOracles],
  [SupportedChains.chapel]: [...baseOracles, OracleTypes.ChainlinkPriceOracleV2, OracleTypes.UniswapTwapPriceOracleV2],
  [SupportedChains.bsc]: [
    ...baseOracles,
    OracleTypes.ChainlinkPriceOracleV2,
    OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    OracleTypes.UniswapLpTokenPriceOracle,
    OracleTypes.UniswapTwapPriceOracleV2,
  ],
  [SupportedChains.evmos_testnet]: [
    ...baseOracles,
    OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    OracleTypes.UniswapLpTokenPriceOracle,
    OracleTypes.UniswapTwapPriceOracleV2,
  ],
  [SupportedChains.evmos]: [
    ...baseOracles,
    OracleTypes.UniswapLpTokenPriceOracle,
    OracleTypes.UniswapTwapPriceOracleV2,
  ],
  [SupportedChains.aurora]: [...baseOracles],
  [SupportedChains.moonbeam]: [
    ...baseOracles,
    OracleTypes.FluxPriceOracle,
    OracleTypes.UniswapLpTokenPriceOracle,
    OracleTypes.UniswapTwapPriceOracleV2,
  ],

  [SupportedChains.moonbase_alpha]: [...baseOracles],
  [SupportedChains.neon_devnet]: [...baseOracles],
  [SupportedChains.polygon]: [
    ...baseOracles,
    OracleTypes.ChainlinkPriceOracleV2,
    OracleTypes.CurveLpTokenPriceOracleNoRegistry,
    OracleTypes.UniswapLpTokenPriceOracle,
    OracleTypes.UniswapTwapPriceOracleV2,
    OracleTypes.GelatoGUniPriceOracle,
  ],
};

export default oracles;
