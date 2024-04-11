export enum SupportedChains {
  ethereum = 1,
  bsc = 56,
  chapel = 97,
  ganache = 1337,
  neon = 245022934,
  polygon = 137,
  arbitrum = 42161,
  linea = 59144,
  zkevm = 1101,
  mode = 34443,
  base = 8453
}

export const SupportedChainsArray = Object.entries(SupportedChains)
  .map(([, value]) => value)
  .filter((value) => typeof value === "number");

export enum RedemptionStrategyContract {
  CurveLpTokenLiquidatorNoRegistry = "CurveLpTokenLiquidatorNoRegistry",
  XBombLiquidatorFunder = "XBombLiquidatorFunder",
  JarvisLiquidatorFunder = "JarvisLiquidatorFunder",
  UniswapLpTokenLiquidator = "UniswapLpTokenLiquidator",
  UniswapV2LiquidatorFunder = "UniswapV2LiquidatorFunder",
  UniswapV3LiquidatorFunder = "UniswapV3LiquidatorFunder",
  GelatoGUniLiquidator = "GelatoGUniLiquidator",
  GammaAlgebraLpTokenLiquidator = "GammaAlgebraLpTokenLiquidator",
  GammaUniswapV3LpTokenLiquidator = "GammaUniswapV3LpTokenLiquidator",
  GammaAlgebraLpTokenWrapper = "GammaAlgebraLpTokenWrapper",
  GammaUniswapV3LpTokenWrapper = "GammaUniswapV3LpTokenWrapper",
  CurveSwapLiquidator = "CurveSwapLiquidator",
  CurveSwapLiquidatorFunder = "CurveSwapLiquidatorFunder",
  CurveLpTokenWrapper = "CurveLpTokenWrapper",
  SaddleLpTokenLiquidator = "SaddleLpTokenLiquidator",
  BalancerLpTokenLiquidator = "BalancerLpTokenLiquidator",
  BalancerSwapLiquidator = "BalancerSwapLiquidator",
  ERC4626Liquidator = "ERC4626Liquidator",
  AlgebraSwapLiquidator = "AlgebraSwapLiquidator",
  SolidlyLpTokenLiquidator = "SolidlyLpTokenLiquidator",
  SolidlyLpTokenWrapper = "SolidlyLpTokenWrapper",
  SolidlySwapLiquidator = "SolidlySwapLiquidator",
  AaveTokenLiquidator = "AaveTokenLiquidator",
  KimUniV2Liquidator = "KimUniV2Liquidator"
}

export enum FundingStrategyContract {
  JarvisLiquidatorFunder = "JarvisLiquidatorFunder",
  XBombLiquidatorFunder = "XBombLiquidatorFunder",
  UniswapV3LiquidatorFunder = "UniswapV3LiquidatorFunder",
  CurveSwapLiquidatorFunder = "CurveSwapLiquidatorFunder"
}

export enum DelegateContractName {
  CErc20Delegate = "CErc20Delegate",
  CErc20PluginDelegate = "CErc20PluginDelegate",
  CErc20PluginRewardsDelegate = "CErc20PluginRewardsDelegate"
}

export enum OracleTypes {
  ChainlinkPriceOracleV2 = "ChainlinkPriceOracleV2",
  API3PriceOracle = "API3PriceOracle",
  CurveLpTokenPriceOracleNoRegistry = "CurveLpTokenPriceOracleNoRegistry",
  CurveV2PriceOracle = "CurveV2PriceOracle",
  CurveV2LpTokenPriceOracleNoRegistry = "CurveV2LpTokenPriceOracleNoRegistry",
  DiaPriceOracle = "DiaPriceOracle",
  FixedNativePriceOracle = "FixedNativePriceOracle",
  UmbrellaPriceOracle = "UmbrellaPriceOracle",
  MasterPriceOracle = "MasterPriceOracle",
  SimplePriceOracle = "SimplePriceOracle",
  UniswapLpTokenPriceOracle = "UniswapLpTokenPriceOracle",
  UniswapTwapPriceOracleV2 = "UniswapTwapPriceOracleV2",
  UniswapV3PriceOracle = "UniswapV3PriceOracle",
  KyberSwapPriceOracle = "KyberSwapPriceOracle",
  AlgebraPriceOracle = "AlgebraPriceOracle",
  AnkrCertificateTokenPriceOracle = "AnkrCertificateTokenPriceOracle",
  GammaPoolAlgebraPriceOracle = "GammaPoolAlgebraPriceOracle",
  GammaPoolUniswapV3PriceOracle = "GammaPoolUniswapV3PriceOracle",
  GelatoGUniPriceOracle = "GelatoGUniPriceOracle",
  BalancerLpTokenPriceOracle = "BalancerLpTokenPriceOracle",
  BalancerLpStablePoolPriceOracle = "BalancerLpStablePoolPriceOracle",
  BalancerRateProviderOracle = "BalancerRateProviderOracle",
  BalancerLpLinearPoolPriceOracle = "BalancerLpLinearPoolPriceOracle",
  BalancerLpTokenPriceOracleNTokens = "BalancerLpTokenPriceOracleNTokens",
  StkBNBPriceOracle = "StkBNBPriceOracle",
  WombatLpTokenPriceOracle = "WombatLpTokenPriceOracle",
  SaddleLpPriceOracle = "SaddleLpPriceOracle",
  SolidlyLpTokenPriceOracle = "SolidlyLpTokenPriceOracle",
  WSTEthPriceOracle = "WSTEthPriceOracle",
  ERC4626Oracle = "ERC4626Oracle",
  PythPriceOracle = "PythPriceOracle",
  RedstoneAdapterPriceOracle = "RedstoneAdapterPriceOracle"
}

export enum IrmTypes {
  JumpRateModel = "JumpRateModel",
  AnkrFTMInterestRateModel = "AnkrFTMInterestRateModel",
  AnkrBNBInterestRateModel = "AnkrBNBInterestRateModel",
  AdjustableAnkrBNBIrm = "AdjustableAnkrBNBIrm",
  AdjustableJumpRateModel_PSTAKE_WBNB = "AdjustableJumpRateModel_PSTAKE_WBNB",
  AdjustableJumpRateModel_MIXBYTES_XCDOT = "AdjustableJumpRateModel_MIXBYTES_XCDOT",
  AdjustableJumpRateModel_TRANSFERO_BRZ = "AdjustableJumpRateModel_TRANSFERO_BRZ",
  AdjustableJumpRateModel_TRANSFERO_BTCB_ETH_MAI_WBNB = "AdjustableJumpRateModel_TRANSFERO_BTCB_ETH_MAI_WBNB",
  AdjustableJumpRateModel_STADER_WBNB = "AdjustableJumpRateModel_STADER_WBNB",
  AdjustableJumpRateModel_MIXBYTES_USDC = "AdjustableJumpRateModel_MIXBYTES_USDC",
  AdjustableJumpRateModel_JARVIS_jBRL = "AdjustableJumpRateModel_JARVIS_jBRL",
  AdjustableJumpRateModel_JARVIS_jEUR = "AdjustableJumpRateModel_JARVIS_jEUR"
}

export enum LiquidationStrategy {
  DEFAULT = "DEFAULT",
  UNISWAP = "UNISWAP"
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
  SUPPLY_ABOVE_MAX
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
  UTILIZATION_ABOVE_MAX
}

export enum FundOperationMode {
  SUPPLY,
  WITHDRAW,
  BORROW,
  REPAY
}

export enum assetOriginalSymbols {
  // thena
  "sAMM-jBRL/BRZ" = "jBRL/BRZ Thena LP",
  "sAMM-HAY/BUSD" = "HAY/BUSD Thena LP",
  "vAMM-ANKR/ankrBNB" = "ankrBNB/ANKR Thena LP",
  "vAMM-ANKR/HAY" = "HAY/ANKR Thena LP",
  "vAMM-HAY/ankrBNB" = "HAY/ankrBNB Thena LP",
  "sAMM-stkBNB/WBNB" = "stkBNB/WBNB Thena LP",
  // Balancer
  "WMATIC_MATICX_STABLE_BLP" = "WMATIC-MATICX Balancer Stable LP",
  // Pearl
  "sAMM-USDC/USDR" = "USDC/USDR Pearl Stable LP",
  "sAMM-DAI/USDR" = "DAI/USDR Pearl Stable LP",
  "vAMM-wUSDR/USDR" = "wUSDR/USDR Pearl Variable LP",
  "vAMM-MATIC/USDR" = "MATIC/USDR Pearl Variable LP",
  "vAMM-WBTC/USDR" = "WBTC/USDR Pearl Variable LP",
  "vAMM-WETH/USDR" = "WETH/USDR Pearl Variable LP",
  "vAMM-TNGBL/USDR" = "TNGBL/USDR Pearl Variable LP"
}

export enum assetSymbols {
  // agnostic
  WETH = "WETH",
  DAI = "DAI",
  ETH = "ETH",
  AUTO = "AUTO",
  BIFI = "BIFI",
  USDC = "USDC",
  USDT = "USDT",
  UST = "UST",
  TUSD = "TUSD",
  FRAX = "FRAX",
  FTM = "FTM",
  WBTC = "WBTC",
  BAL = "BAL",
  BTC = "BTC",
  LINK = "LINK",
  AAVE = "AAVE",
  ALCX = "ALCX",
  AVAX = "AVAX",
  AXS = "AXS",
  CRV = "CRV",
  CVX = "CVX",
  FXS = "FXS",
  GHST = "GHST",
  GRT = "GRT",
  MAI = "MAI",
  MIM = "MIM",
  MKR = "MKR",
  RAI = "RAI",
  SNX = "SNX",
  UNI = "UNI",
  SOL = "SOL",
  SUSHI = "SUSHI",
  YFI = "YFI",
  ezETH = "ezETH",
  weETH = "weETH",
  wstETH = "wstETH",
  stETH = "stETH",
  swETH = "swETH",
  rETH = "rETH",
  cbETH = "cbETH",
  ankrETH = "ankrETH",
  frxETH = "frxETH",
  sfrxETH = "sfrxETH",
  AERO = "AERO"
}

export enum Roles {
  REGISTRY_ROLE,
  SUPPLIER_ROLE,
  BORROWER_ROLE,
  LIQUIDATOR_ROLE,
  LEVERED_POSITION_ROLE
}
