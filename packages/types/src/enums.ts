export enum SupportedChains {
  mode = 34443,
  base = 8453,
  optimism = 10,
  bob = 60808,
  fraxtal = 252,
  lisk = 1135,
  ink = 57073,
  superseed = 5330,
  worldchain = 480,
  swell = 1923,
  soneium = 1868,
  ozeantest = 7849306,
  camptest = 325000,
  metalL2 = 1750
}

export const SupportedChainsArray = Object.entries(SupportedChains)
  .map(([, value]) => value)
  .filter((value) => typeof value === "number");

export enum RedemptionStrategyContract {
  AerodromeV2Liquidator = "AerodromeV2Liquidator",
  AerodromeCLLiquidator = "AerodromeCLLiquidator",
  UniswapV2LiquidatorFunder = "UniswapV2LiquidatorFunder",
  UniswapV3LiquidatorFunder = "UniswapV3LiquidatorFunder",
  AlgebraSwapLiquidator = "AlgebraSwapLiquidator",
  KimUniV2Liquidator = "KimUniV2Liquidator"
}

export enum FundingStrategyContract {
  UniswapV3LiquidatorFunder = "UniswapV3LiquidatorFunder"
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
  RedstoneAdapterPriceOracle = "RedstoneAdapterPriceOracle",
  RedstoneAdapterWrsETHPriceOracle = "RedstoneAdapterWrsETHPriceOracle",
  AerodromePriceOracle = "AerodromePriceOracle",
  VelodromePriceOracle = "VelodromePriceOracle",
  eOracle = "eOracle"
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

export enum ChainlinkFeedBaseCurrency {
  ETH,
  USD
}

export enum assetSymbols {
  // mode
  WETH = "WETH",
  ezETH = "ezETH",
  weETH = "weETH",
  "weETH.mode" = "weETH.mode",
  wrsETH = "wrsETH",
  ETH = "ETH",
  USDC = "USDC",
  USDT = "USDT",
  WBTC = "WBTC",
  mBTC = "M-BTC",
  MODE = "MODE",
  ION = "ION",
  KIM = "KIM",
  IONWETH = "ION-WETH",
  IUSDCIUSDT = "ionUSDC-ionUSDT",
  USDe = "USDe",
  sUSDe = "sUSDe",
  dMBTC = "dMBTC",
  STONE = "STONE",
  msDAI = "msDAI",
  oBTC = "oBTC",
  uniBTC = "uniBTC",
  uBTC = "uBTC",
  LBTC = "LBTC",

  // base
  AERO = "AERO",
  bsdETH = "bsdETH",
  eUSD = "eUSD",
  hyUSD = "hyUSD",
  RSR = "RSR",
  cbBTC = "cbBTC",
  superOETHb = "superOETHb",
  wsuperOETHb = "wsuperOETHb",
  wUSDM = "wUSDM",
  OGN = "OGN",
  EURC = "EURC",
  USDplus = "USD+",
  wUSDplus = "wUSD+",
  USDz = "USDz",
  uSOL = "uSOL",
  uSUI = "uSUI",
  sUSDz = "sUSDz",
  fBOMB = "fBOMB",
  KLIMA = "KLIMA",
  uXRP = "uXRP",
  ionicUSDC = "ionicUSDC",
  ionicWETH = "ionicWETH",
  mBASIS = "mBASIS",
  msETH = "msETH",
  msUSD = "msUSD",

  // optimism
  OP = "OP",
  LUSD = "LUSD",

  // bob
  tBTC = "tBTC",
  SOV = "SOV",

  // fraxtal
  wFRXETH = "wFRXETH",
  sFRXETH = "sFRXETH",
  sFRAX = "sFRAX",
  frxBTC = "frxBTC",
  insfrxETH = "insfrxETH",

  // lisk
  LSK = "LSK",

  // ozean
  WUSDX = "WUSDX",

  // soneium
  ASTR = "ASTR",

  // swell
  rswETH = "rswETH",

  // superseed
  oUSDT = "oUSDT",

  // metalL2
  MTL = "MTL",

  // legacy
  DAI = "DAI",
  AUTO = "AUTO",
  BIFI = "BIFI",
  UST = "UST",
  TUSD = "TUSD",
  FRAX = "FRAX",
  FTM = "FTM",
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
  TNGBL = "TNGBL",
  DUSD = "DUSD",
  CASH = "CASH",

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
  "sAMM-DAI/USDR" = "sAMM-DAI-USDR",
  "vAMM-wUSDR/USDR" = "vAMM-wUSDR-USDR",
  "vAMM-MATIC/USDR" = "vAMM-MATIC-USDR",
  "vAMM-TNGBL/USDR" = "vAMM-TNGBL-USDR",
  "vAMM-WBTC/USDR" = "vAMM-WBTC-USDR",
  "vAMM-WETH/USDR" = "vAMM-WETH-USDR",

  // Retro
  aUSDC_CASH_N = "aUSDC-CASH-N",
  aUSDC_WETH_N = "aUSDC-WETH-N",
  aWMATIC_MATICX_N = "aWMATIC-MATICX-N",
  aWBTC_WETH_N = "aWBTC-WETH-N",

  // Arbitrum
  "2pool" = "2pool",
  GOHM = "GOHM",
  OHM = "OHM",
  "WETH-GOHM" = "WETH-GOHM",
  DPX = "DPX",
  MAGIC = "MAGIC",
  GMX = "GMX",
  USDs = "USDs",

  PAR_USDC_CURVE = "PAR_USDC CURVE",
  triCrypto = "triCrypto",

  // Mainnet
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
  sfrxETH = "sfrxETH",
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

export enum Roles {
  REGISTRY_ROLE,
  SUPPLIER_ROLE,
  BORROWER_ROLE,
  LIQUIDATOR_ROLE,
  LEVERED_POSITION_ROLE
}
