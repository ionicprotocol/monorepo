export enum SupportedChains {
  bsc = 56,
  chapel = 97,
  ganache = 1337,
  aurora = 1313161555,
  evmos = 9001,
  evmos_testnet = 9000,
  moonbeam = 1284,
  moonbase_alpha = 1287,
}

export enum RedemptionStrategy {
  CurveLpTokenLiquidatorNoRegistry = "CurveLpTokenLiquidatorNoRegistry",
  XBombLiquidator = "XBombLiquidator",
  jBRLLiquidator = "jBRLLiquidator",
}

export enum DelegateContractName {
  CErc20Delegate = "CErc20Delegate",
  CEtherDelegate = "CEtherDelegate",
  CErc20PluginDelegate = "CErc20PluginDelegate",
  CErc20PluginRewardsDelegate = "CErc20PluginRewardsDelegate",
}

export enum OracleTypes {
  MasterPriceOracle = "MasterPriceOracle",
  SimplePriceOracle = "SimplePriceOracle",
  ChainlinkPriceOracleV2 = "ChainlinkPriceOracleV2",
  UniswapTwapPriceOracleV2 = "UniswapTwapPriceOracleV2",
}

export enum LiquidationStrategy {
  DEFAULT = "DEFAULT",
  UNISWAP = "UNISWAP",
}

export enum LiquidationKind {
  DEFAULT_NATIVE_BORROW = "DEFAULT_NATIVE_BORROW",
  DEFAULT_TOKEN_BORROW = "DEFAULT_TOKEN_BORROW",
  UNISWAP_NATIVE_BORROW = "UNISWAP_NATIVE_BORROW",
  UNISWAP_TOKEN_BORROW = "UNISWAP_TOKEN_BORROW",
}
