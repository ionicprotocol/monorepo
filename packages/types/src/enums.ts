export enum SupportedChains {
  ethereum = 1,
  bsc = 56,
  chapel = 97,
  ganache = 1337,
  neon = 245022934,
  polygon = 137,
  arbitrum = 42161,
  lineagoerli = 59140
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
  UniswapV3Liquidator = "UniswapV3Liquidator",
  GelatoGUniLiquidator = "GelatoGUniLiquidator",
  GammaLpTokenLiquidator = "GammaLpTokenLiquidator",
  GammaLpTokenWrapper = "GammaLpTokenWrapper",
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
  AaveTokenLiquidator = "AaveTokenLiquidator"
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
  AlgebraPriceOracle = "AlgebraPriceOracle",
  AnkrCertificateTokenPriceOracle = "AnkrCertificateTokenPriceOracle",
  GammaPoolPriceOracle = "GammaPoolPriceOracle",
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
  ERC4626Oracle = "ERC4626Oracle"
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
  "WMATIC_MATICX_STABLE_BLP" = "WMATIC-MATICX Balancer Stable LP",
  "sAMM-USDC/USDR" = "USDC/USDR Pearl Stable LP",
  "vAMM-wUSDR/USDR" = "wUSDR/USDR Pearl Variable LP",
  "vAMM-stMATIC/USDR" = "stMATIC/USDR Pearl Variable LP"
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
  mai3EPS = "mai3EPS",
  val3EPS = "val3EPS",
  valdai3EPS = "valdai3EPS",
  "2brl" = "2brl",
  "3brl" = "3brl",
  jBRL = "jBRL",
  BRZ = "BRZ",
  BRZw = "BRZw",
  BOMB = "BOMB",
  xBOMB = "xBOMB",
  ankrBNB = "ankrBNB",
  stkBNB = "stkBNB",
  SAFEMOON = "SAFEMOON",
  HAY = "HAY",
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
  "ANKR-ankrBNB" = "ANKR-ankrBNB",

  "stkBNB-WBNB" = "stkBNB-WBNB",
  BNBx = "BNBx",
  "epsBNBx-BNB" = "epsBNBx-BNB",
  "asBNBx-WBNB" = "ApeSwap BNBx-WBNB LP",
  "asANKR-ankrBNB" = "ApeSwap ANKR-ankrBNB LP",

  DDD = "DDD",
  EPX = "EPX",
  pSTAKE = "pSTAKE",
  ANKR = "ANKR",
  SD = "SD", // stader labs
  THE = "THE",
  RDNT = "RDNT",

  // thena
  "sAMM-jBRL/BRZ" = "sAMM-jBRL-BRZ",
  "sAMM-HAY/BUSD" = "sAMM-HAY-BUSD",
  "sAMM-stkBNB/WBNB" = "sAMM-stkBNB-WBNB",
  "vAMM-ANKR/ankrBNB" = "vAMM-ANKR-ankrBNB",
  "vAMM-ANKR/HAY" = "vAMM-ANKR-HAY",
  "vAMM-HAY/ankrBNB" = "vAMM-HAY-ankrBNB",
  aWBNB_STKBNB = "aWBNB-STKBNB",
  aWBNB_BTCB = "aWBNB-BTCB",
  aWBNB_ETH = "aWBNB-ETH",
  aANKRBNB_ANKR_W = "aANKRBNB-ANKR-W",
  aANKRBNB_ANKR_N = "aANKRBNB-ANKR-N",
  aANKRBNB_RDNT_W = "aANKRBNB-RDNT-W",
  aANKRBNB_RDNT_N = "aANKRBNB-RDNT-N",
  aANKRBNB_THE_W = "aANKRBNB-THE-W",
  aANKRBNB_THE_N = "aANKRBNB-THE-N",

  "WOMBATLP-WBNB" = "WOMBATLP-WBNB",

  // local
  TOUCH = "TOUCH",
  TRIBE = "TRIBE",

  // neon
  WNEON = "WNEON",
  MORA = "MORA",

  // polygon
  WMATIC = "WMATIC",
  oBNB = "oBNB",
  "WMATIC-USDC" = "WMATIC-USDC",
  "WMATIC-ETH" = "WMATIC-ETH",
  "WMATIC-USDT" = "WMATIC-USDT",
  "WMATIC-MATICx" = "WMATIC-MATICx",
  "WETH-WBTC" = "WETH-WBTC",
  "JEUR-PAR" = "jEUR-PAR",
  "MAI-USDC" = "MAI-USDC",
  am3CRV = "am3CRV",
  amUSDC = "amUSDC",
  AGEUR = "agEUR",
  EURT = "EURT",
  EURE = "EURE",
  CADC = "CADC",
  JEUR = "jEUR",
  PAR = "PAR",
  MIMO = "MIMO",
  JRT = "JRT",
  aMATICb = "aMATICb",
  aMATICc = "aMATICc",
  MATICx = "MATICx",
  stMATIC = "stMATIC",
  csMATIC = "csMATIC",
  IXT = "IXT",
  GNS = "GNS",
  "DAI-GNS" = "DAI-GNS",
  "IXT-USDT" = "IXT-USDT",
  USDR = "USDR",
  WUSDR = "WUSDR",
  USDR3CRV = "USDR3CRV",
  TNGBL = "TNGBL",

  // Balancer
  MIMO_PAR_80_20 = "MIMO80-PAR20 BLP",
  MIMO_PAR_75_25 = "MIMO75-PAR25 BLP",
  BRZ_JBRL_STABLE_BLP = "BRZ_JBRL STABLE BLP",
  JEUR_PAR_STABLE_BLP = "JEUR_PAR STABLE BLP",
  WMATIC_STMATIC_STABLE_BLP = "WMATIC_STMATIC STABLE BLP",
  WMATIC_CSMATIC_STABLE_BLP = "WMATIC_CSMATIC STABLE BLP",
  WMATIC_MATICX_STABLE_BLP = "WMATIC_MATICX STABLE BLP",
  TETU_BOOSTED_STABLE_BLP = "TETU_BOOSTED STABLE BLP",
  TETU_LINEAR_USDT = "TETU_LINEAR USDT",
  TETU_LINEAR_USDC = "TETU_LINEAR USDC",
  TETU_LINEAR_DAI = "TETU_LINEAR DAI",
  AAVE_LINEAR_WMATIC = "AAVE_LINEAR WMATIC",
  MaticX_bbaWMATIC = "MaticX-bba-WMATIC",
  StMatic_bbaWMATIC = "StMatic-bba-WMATIC",

  // Arrakis Vaults [arrakis_pair_fee_tier]
  arrakis_USDC_WETH_005 = "Arrakis Vault V1 USDC-WETH (0.05)",
  arrakis_WBTC_WETH_005 = "Arrakis Vault V1 WBTC-WETH (0.05)",
  arrakis_USDC_PAR_005 = "G-UNI USDC-PAR Vault (0.05)",
  arrakis_WMATIC_USDC_005 = "Arrakis Vault V1 WMATIC-USDC (0.05)",
  arrakis_USDC_agEUR_001 = "Arrakis Vault V1 USDC-agEUR (0.01)",
  arrakis_WMATIC_WETH_005 = "Arrakis Vault V1 WMATIC-WETH (0.05)",
  arrakis_WMATIC_AAVE_03 = "Arrakis Vault V1 WMATIC-AAVE (0.3)",
  arrakis_USDC_MAI_005 = "Arrakis Vault V1 USDC-miMATIC (0.05)",
  arrakis_USDC_USDT_001 = "Arrakis Vault V1 USDC-USDT (0.01)",
  arrakis_USDC_USDT_005 = "Arrakis Vault V1 USDC-USDT (0.05)",
  arrakis_USDC_DAI_005 = "G-UNI USDC-DAI Vault (0.05)",
  arrakis_WETH_DAI_03 = "G-UNI WETH-DAI Vault (0.3)",

  // Pearl
  "sAMM-USDC/USDR" = "sAMM-USDC-USDR",
  "vAMM-wUSDR/USDR" = "sAMM-wUSDR-USDR",
  "vAMM-stMATIC/USDR" = "vAMM-stMATIC-USDR",

  // Arbitrum
  "2pool" = "2pool",
  GOHM = "GOHM",
  OHM = "OHM",
  "WETH-GOHM" = "WETH-GOHM",
  DPX = "DPX",
  MAGIC = "MAGIC",
  GMX = "GMX",
  saddleFraxBP = "saddleFraxBP",
  saddleFraxUsdsBP = "saddleFraxUsdsBP",
  saddleFraxUsdtBP = "saddleFraxUsdtBP",
  USDs = "USDs",

  PAR_USDC_CURVE = "PAR_USDC CURVE",
  triCrypto = "triCrypto",

  // Mainnet
  eUSD = "eUSD",
  realYieldUSD = "realYieldUSD",
  realYieldETH = "realYieldETH",
  ethBtcTrend = "ethBtcTrend",
  ethBtcMomentum = "ethBtcMomentum",
  wstETH = "wstETH",
  stETH = "stETH",
  swETH = "swETH",
  rETH = "rETH",
  cbETH = "cbETH",
  ankrETH = "ankrETH",
  frxETH = "frxETH",
  SWETH_BBA_WETH_BPT = "swETH-bba-WETH-BPT",
  WSTETH_WETH_STABLE_BPT = "wstETH-WETH-Stable-BPT",
  WSTETH_RETH_FRXETH_STABLE_BPT = "wstETH-rETH-frxETH-Stable-BPT",
  WBETH_WSTETH_STABLE_BPT = "WBETH-wstETH-Stable-BPT",
  WSTETH_CBETH_STABLE_BPT = "wstETH-cbETH-Stable-BPT",
  OHM50_DAI50_BPT = "OHM50-DAI50 BPT",
  OHM50_WETH50_BPT = "OHM50-WETH50 BPT",
  AAVE_BOOSTED_STABLE_BPT = "AAVE-bba-stable-BPT",
  AAVE_LINEAR_DAI = "AAVE-LINEAR-DAI",
  AAVE_LINEAR_USDC = "AAVE-LINEAR-USDC",
  AAVE_LINEAR_USDT = "AAVE-LINEAR-USDT",
  AAVE_LINEAR_WETH = "AAVE-LINEAR-WETH",

  TDAI = "TDAI"
}
