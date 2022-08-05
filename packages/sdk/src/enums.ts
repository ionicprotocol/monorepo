export enum SupportedChains {
  bsc = 56,
  chapel = 97,
  ganache = 1337,
  aurora = 1313161555,
  evmos = 9001,
  evmos_testnet = 9000,
  moonbeam = 1284,
  moonbase_alpha = 1287,
  neon_devnet = 245022926,
  polygon = 137,
}

export const SupportedChainsArray = Object.entries(SupportedChains)
  .map(([, value]) => value)
  .filter((value) => typeof value === "number");

export enum RedemptionStrategyContract {
  CurveLpTokenLiquidatorNoRegistry = "CurveLpTokenLiquidatorNoRegistry",
  XBombLiquidator = "XBombLiquidator",
  JarvisSynthereumLiquidator = "JarvisSynthereumLiquidator",
  UniswapLpTokenLiquidator = "UniswapLpTokenLiquidator",
}

export enum DelegateContractName {
  CErc20Delegate = "CErc20Delegate",
  CErc20PluginDelegate = "CErc20PluginDelegate",
  CErc20PluginRewardsDelegate = "CErc20PluginRewardsDelegate",
}

export enum OracleTypes {
  ChainlinkPriceOracleV2 = "ChainlinkPriceOracleV2",
  CurveLpTokenPriceOracleNoRegistry = "CurveLpTokenPriceOracleNoRegistry",
  DiaPriceOracle = "DiaPriceOracle",
  FixedNativePriceOracle = "FixedNativePriceOracle",
  FluxPriceOracle = "FluxPriceOracle",
  MasterPriceOracle = "MasterPriceOracle",
  SimplePriceOracle = "SimplePriceOracle",
  UniswapLpTokenPriceOracle = "UniswapLpTokenPriceOracle",
  UniswapTwapPriceOracleV2 = "UniswapTwapPriceOracleV2",
  AnkrBNBcPriceOracle = "AnkrBNBcPriceOracle",
}

export enum IrmTypes {
  JumpRateModel = "JumpRateModel",
  WhitePaperInterestRateModel = "WhitePaperInterestRateModel",
  AnkrBNBInterestRateModel = "AnkrBNBInterestRateModel",
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

export enum ComptrollerErrorCodes {
  NO_ERROR,
  UNAUTHORIZED,
  COMPTROLLER_MISMATCH,
  INSUFFICIENT_SHORTFALL,
  INSUFFICIENT_LIQUIDITY,
  INVALID_CLOSE_FACTOR,
  INVALID_COLLATERAL_FACTOR,
  INVALID_LIQUIDATION_INCENTIVE,
  MARKET_NOT_ENTERED, // no longer possible
  MARKET_NOT_LISTED,
  MARKET_ALREADY_LISTED,
  MATH_ERROR,
  NONZERO_BORROW_BALANCE,
  PRICE_ERROR,
  REJECTION,
  SNAPSHOT_ERROR,
  TOO_MANY_ASSETS,
  TOO_MUCH_REPAY,
  SUPPLIER_NOT_WHITELISTED,
  BORROW_BELOW_MIN,
  SUPPLY_ABOVE_MAX,
}

export enum CTokenErrorCodes {
  NO_ERROR,
  UNAUTHORIZED,
  BAD_INPUT,
  COMPTROLLER_REJECTION,
  COMPTROLLER_CALCULATION_ERROR,
  INTEREST_RATE_MODEL_ERROR,
  INVALID_ACCOUNT_PAIR,
  INVALID_CLOSE_AMOUNT_REQUESTED,
  INVALID_COLLATERAL_FACTOR,
  MATH_ERROR,
  MARKET_NOT_FRESH,
  MARKET_NOT_LISTED,
  TOKEN_INSUFFICIENT_ALLOWANCE,
  TOKEN_INSUFFICIENT_BALANCE,
  TOKEN_INSUFFICIENT_CASH,
  TOKEN_TRANSFER_IN_FAILED,
  TOKEN_TRANSFER_OUT_FAILED,
  UTILIZATION_ABOVE_MAX,
}

export enum FundOperationMode {
  SUPPLY,
  WITHDRAW,
  BORROW,
  REPAY,
}
