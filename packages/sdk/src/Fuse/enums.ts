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
