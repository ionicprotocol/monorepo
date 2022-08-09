export enum SupportedChains {
  bsc = 56,
  chapel = 97,
  ganache = 1337,
  evmos = 9001,
  moonbeam = 1284,
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
  GelatoGUniPriceOracle = "GelatoGUniPriceOracle",
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
  SOL = "SOL",
  SUSHI = "SUSHI",
  YFI = "YFI",

  // bsc
  WBNB = "WBNB",
  BNB = "BNB",
  BUSD = "BUSD",
  BTCB = "BTCB",
  BETH = "BETH",
  CAKE = "CAKE",
  ALPACA = "ALPACA",
  "3EPS" = "3EPS",
  val3EPS = "val3EPS",
  valdai3EPS = "valdai3EPS",
  "2brl" = "2brl",
  jBRL = "jBRL",
  BRZ = "BRZ",
  BOMB = "BOMB",
  xBOMB = "xBOMB",
  aBNBc = "aBNBc",
  SAFEMOON = "SAFEMOON",
  "WBNB-DAI" = "WBNB-DAI",
  "WBNB-BUSD" = "WBNB-BUSD",
  "WBNB-USDT" = "WBNB-USDT",
  "WBNB-USDC" = "WBNB-USDC",
  "WBNB-ETH" = "WBNB-ETH",

  "BUSD-USDT" = "BUSD-USDT",
  "BUSD-BTCB" = "BUSD-BTCB",
  "USDC-BUSD" = "USDC-BUSD",
  "USDC-ETH" = "USDC-ETH",

  "BTCB-BOMB" = "BTCB-BOMB",
  "BTCB-ETH" = "BTCB-ETH",

  "CAKE-WBNB" = "CAKE-WBNB",

  // evmos
  saddleOptFraxUSD = "saddleOptFraxUSD",
  saddleOptUSD = "saddleOptUSD",
  WEVMOS = "WEVMOS",
  ATOM = "ATOM",

  // moonbeam
  GLMR = "GLMR",
  WGLMR = "WGLMR",
  GLINT = "GLINT",
  "GLMR-USDC" = "GLMR-USDC",
  "GLMR-GLINT" = "GLMR-GLINT",
  "WGLMR-xcDOT" = "WGLMR-xcDOT",
  "GLMR-madUSDC" = "GLMR-madUSDC",
  DOT = "DOT",
  xcDOT = "xcDOT",
  KSM = "KSM",
  madWBTC = "madWBTC",
  madUSDC = "madUSDC",
  multiUSDC = "multiUSDC",
  madUSDT = "madUSDT",
  multiUSDT = "multiUSDT",
  madDAI = "madDAI",
  multiDAI = "multiDAI",

  // moonbase
  WDEV = "WDEV",

  // local
  TOUCH = "TOUCH",
  TRIBE = "TRIBE",

  // aurora
  WNEAR = "WNEAR",

  // neon
  WNEON = "WNEON",

  // polygon
  WMATIC = "WMATIC",
  oBNB = "oBNB",
  "WMATIC-USDC" = "WMATIC-USDC",
  "WMATIC-ETH" = "WMATIC-ETH",
  "WMATIC-USDT" = "WMATIC-USDT",
  "WETH-WBTC" = "WETH-WBTC",
  "AGEUR-JEUR" = "AGEUR-JEUR",
  "JEUR-PAR" = "JEUR-PAR",
  "JEUR-EURT" = "JEUR-EURT",
  "JJPY-JPYC" = "JJPY-JPYC",
  "JCAD-CADC" = "JCAD-CADC",
  "JSGD-XSGD" = "JSGD-XSGD",
  "JNZD-NZDS" = "JNZD-NZDS",
  AGEUR = "AGEUR",
  EURT = "EURT",
  CADC = "CADC",
  JSGD = "JSGD",
  JJPY = "JJPY",
  JAUD = "JAUD",
  JCAD = "JCAD",
  JNZD = "JNZD",
  JCHF = "JCHF",
  JCNY = "JCNY",
  JEUR = "JEUR",
  JKRW = "JKRW",
  JMXN = "JMXN",
  JGBP = "JGBP",
  JPLN = "JPLN",
  JPHP = "JPHP",
  JPYC = "JPYC",
  JSEK = "JSEK",
  PAR = "PAR",
  NZDS = "NZDS",
  XSGD = "XSGD",

  // Arrakis Vaults [arrakis_pair_fee_tier]
  arrarkis_USDC_WETH_005 = "arrarkis_USDC_WETH_005",
  arrarkis_WBTC_WETH_005 = "arrarkis_WBTC_WETH_005",
  arrarkis_USDC_PAR_005 = "arrarkis_USDC_PAR_005",
  arrarkis_WMATIC_USDC_005 = "arrarkis_WMATIC_USDC_005",
  arrarkis_USDC_agEUR_001 = "arrarkis_USDC_agEUR_001",
  arrarkis_WMATIC_WETH_005 = "arrarkis_WMATIC_WETH_005",
  arrarkis_WMATIC_AAVE_03 = "arrarkis_WMATIC_AAVE_03",
  arrarkis_USDC_MAI_005 = "arrarkis_USDC_MAI_005",
  arrarkis_USDC_USDT_001 = "arrarkis_USDC_USDT_001",
  arrarkis_USDC_USDT_005 = "arrarkis_USDC_USDT_005",
  arrarkis_USDC_DAI_005 = "arrarkis_USDC_DAI_005",
  arrarkis_WETH_DAI_03 = "arrarkis_WETH_DAI_03",
}

export default assetSymbols;
