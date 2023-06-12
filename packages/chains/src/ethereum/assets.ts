import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@midas-capital/types";

import { balancerDocs, defaultDocs, sommFinanceMainnetDocs, wrappedAssetDocs } from "../common";

export const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const wstETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
export const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

const BAL = "0xba100000625a3754423978a60c9317c58a424e3D";
const PAR = "0x68037790A0229e9Ce6EaA8A99ea92964106C4703";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const eUSD = "0x97de57eC338AB5d51557DA3434828C5DbFaDA371";
const GOHM = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
const FRAX = "0x853d955aCEf822Db058eb8505911ED77F175b99e";
const MIM = "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3";
const frxETH = "0x5E8422345238F34275888049021821E8E08CAa1f";
const stETH = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";
const swETH = "0xf951E335afb289353dc249e82926178EaC7DEd78";
const cbETH = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
// const ankrETH = "0xE95A203B1a91a908F9B9CE46459d101078c2c3cb";
const rETH = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const ANKR = "0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4";

// Balancer
const SWETH_BBA_WETH_BPT = "0x02D928E68D8F10C0358566152677Db51E1e2Dc8C";
const WSTETH_WETH_STABLE_BPT = "0x32296969Ef14EB0c6d29669C550D4a0449130230";
const WSTETH_RETH_FRXETH_STABLE_BPT = "0x5aEe1e99fE86960377DE9f88689616916D5DcaBe";
const WBETH_WSTETH_STABLE_BPT = "0x2E848426AEc6dbF2260535a5bEa048ed94d9FF3D";
const WSTETH_CBETH_STABLE_BPT = "0x9c6d47Ff73e0F5E51BE5FD53236e3F595C5793F2";
const OHM50_DAI50_BPT = "0x76FCf0e8C7Ff37A47a799FA2cd4c13cDe0D981C9";
const OHM50_WETH50_BPT = "0xD1eC5e215E8148D76F4460e4097FD3d5ae0A3558";
const AAVE_BOOSTED_STABLE_BPT = "0xfeBb0bbf162E64fb9D0dfe186E517d84C395f016";

const AAVE_LINEAR_DAI = "0x6667c6fa9f2b3Fc1Cc8D85320b62703d938E4385";
const AAVE_LINEAR_USDT = "0xA1697F9Af0875B63DdC472d6EeBADa8C1fAB8568";
const AAVE_LINEAR_USDC = "0xcbFA4532D8B2ade2C261D3DD5ef2A2284f792692";
const AAVE_LINEAR_WETH = "0x60D604890feaa0b5460B28A424407c24fe89374a";
// Require oracles for R
// const R_DAI_STABLE_BPT = "0x20a61B948E33879ce7F23e535CC7BAA3BC66c5a9";
// Requires oracle for STG (PCS V3 works)
// const STG_BOOSTED_WEIGHTED_BPT = "0x639883476960a23b38579acfd7D71561A0f408Cf";

// Sommelier
const realYieldUSD = "0x97e6E0a40a3D02F12d1cEC30ebfbAE04e37C119E";
const realYieldETH = "0xb5b29320d2Dde5BA5BAFA1EbcD270052070483ec";
const ethBtcTrend = "0x6b7f87279982d919Bbf85182DDeAB179B366D8f2";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.BAL,
    underlying: BAL,
    name: "Balancer",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://etherscan.io", BAL),
  },
  {
    symbol: assetSymbols.DAI,
    underlying: DAI,
    name: "Dai Stablecoin",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://etherscan.io", DAI),
  },
  {
    symbol: assetSymbols.FRAX,
    underlying: FRAX,
    name: "Frax",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://etherscan.io", FRAX),
  },
  {
    symbol: assetSymbols.MIM,
    underlying: MIM,
    name: "Magic Internet Money",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://etherscan.io", MIM),
  },
  {
    symbol: assetSymbols.GOHM,
    underlying: GOHM,
    name: "Governance OHM",
    decimals: 18,
    oracle: OracleTypes.UniswapV3PriceOracle,
    extraDocs: defaultDocs("https://etherscan.io", GOHM),
  },
  {
    symbol: assetSymbols.PAR,
    underlying: PAR,
    name: "PAR Stablecoin",
    decimals: 18,
    oracle: OracleTypes.UniswapV3PriceOracle,
    extraDocs: defaultDocs("https://etherscan.io", PAR),
  },
  {
    symbol: assetSymbols.ANKR,
    underlying: ANKR,
    name: "Ankr Network Token",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://etherscan.io", ANKR),
  },
  {
    symbol: assetSymbols.USDC,
    underlying: USDC,
    name: "USD Coin",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://etherscan.io", USDC),
  },
  {
    symbol: assetSymbols.USDT,
    underlying: USDT,
    name: "Tether USD",
    decimals: 6,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://etherscan.io", USDT),
  },
  {
    symbol: assetSymbols.eUSD,
    underlying: eUSD,
    name: "eUSD",
    decimals: 18,
    oracle: OracleTypes.CurveV2PriceOracle,
    extraDocs: defaultDocs("https://etherscan.io", eUSD),
  },
  {
    symbol: assetSymbols.WBTC,
    underlying: WBTC,
    name: "Wrapped BTC",
    decimals: 8,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: defaultDocs("https://etherscan.io", WBTC),
  },
  {
    symbol: assetSymbols.WETH,
    underlying: WETH,
    name: "Wrapped Ether",
    decimals: 18,
    oracle: OracleTypes.FixedNativePriceOracle,
    extraDocs: wrappedAssetDocs(SupportedChains.ethereum),
  },
  {
    symbol: assetSymbols.stETH,
    underlying: stETH,
    name: "Lido Staked Ether",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    disabled: true,
    extraDocs: `
    <p><b>How to acquire this token</b><p/><br />
    <p>You can get stETH by staking your ETH </code> on <a href="https://stake.lido.fi/" target="_blank" style="color: #BCAC83; cursor="pointer">Lido on Mainnet</a></p>`,
  },
  {
    symbol: assetSymbols.wstETH,
    underlying: wstETH,
    name: "Wrapped Staked Ether",
    decimals: 18,
    oracle: OracleTypes.WSTEthPriceOracle,
    extraDocs: `
    <p><b>How to acquire this token</b><p/><br />
    <p>You can get wstETH by wrapping your stETH </code> on <a href="https://stake.lido.fi/wrap" target="_blank" style="color: #BCAC83; cursor="pointer">Lido on Mainnet</a></p>`,
  },
  {
    symbol: assetSymbols.rETH,
    underlying: rETH,
    name: "Rocket Pool ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: `
    <p><b>How to acquire this token</b><p/><br />
    <p>You can get rETH by staking your ETH </code> on <a href="https://stake.rocketpool.net/" target="_blank" style="color: #BCAC83; cursor="pointer">RocketPool on Mainnet</a></p>`,
  },
  {
    symbol: assetSymbols.cbETH,
    underlying: cbETH,
    name: "Coinbase Staked ETH",
    decimals: 18,
    oracle: OracleTypes.ChainlinkPriceOracleV2,
    extraDocs: `
    <p><b>How to acquire this token</b><p/><br />
    <p>You can get cbETH by staking your ETH </code> on <a href="https://www.coinbase.com/earn" target="_blank" style="color: #BCAC83; cursor="pointer">Coinbase</a></p>`,
  },
  {
    symbol: assetSymbols.swETH,
    underlying: swETH,
    name: "Swell ETH",
    decimals: 18,
    oracle: OracleTypes.DiaPriceOracle,
    extraDocs: `
    <p><b>How to acquire this token</b><p/><br />
    <p>You can get swETH by staking your ETH </code> on <a href="https://app.swellnetwork.io/" target="_blank" style="color: #BCAC83; cursor="pointer">Swell</a></p>`,
  },
  {
    symbol: assetSymbols.frxETH,
    underlying: frxETH,
    name: "Frax ETH",
    decimals: 18,
    oracle: OracleTypes.UniswapV3PriceOracle,
    extraDocs: `
    <p><b>How to acquire this token</b><p/><br />
    <p>You can get frxETH by minting it with your ETH </code> on <a href="https://app.frax.finance/frxeth/mint" target="_blank" style="color: #BCAC83; cursor="pointer">Frax Finance</a></p>`,
  },
  // Sommelier Finance
  {
    symbol: assetSymbols.realYieldUSD,
    underlying: realYieldUSD,
    name: "Sommelier Finance Real Yield USD",
    decimals: 18,
    oracle: OracleTypes.ERC4626Oracle,
    extraDocs: sommFinanceMainnetDocs("Real-Yield-USD", realYieldUSD, [
      assetSymbols.USDC,
      assetSymbols.USDT,
      assetSymbols.DAI,
    ]),
  },
  {
    symbol: assetSymbols.realYieldETH,
    underlying: realYieldUSD,
    name: "Sommelier Finance Real Yield ETH",
    decimals: 18,
    oracle: OracleTypes.ERC4626Oracle,
    extraDocs: sommFinanceMainnetDocs("Real-Yield-ETH", realYieldETH, [
      assetSymbols.cbETH,
      assetSymbols.rETH,
      assetSymbols.stETH,
      assetSymbols.WETH,
    ]),
  },
  {
    symbol: assetSymbols.ethBtcTrend,
    underlying: ethBtcTrend,
    name: "Sommelier Finance ETH/BTC Trend",
    decimals: 18,
    oracle: OracleTypes.ERC4626Oracle,
    extraDocs: sommFinanceMainnetDocs("ETH-BTC-Trend", ethBtcTrend, [assetSymbols.WETH, assetSymbols.WBTC]),
  },
  {
    symbol: assetSymbols.SWETH_BBA_WETH_BPT,
    underlying: SWETH_BBA_WETH_BPT,
    name: "SwETH/Boosted Aave V3 WETH",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "ethereum",
      "0x02d928e68d8f10c0358566152677db51e1e2dc8c00000000000000000000051e",
      "SwETH/Boosted Aave V3 WETH",
      SWETH_BBA_WETH_BPT
    ),
  },
  {
    symbol: assetSymbols.WSTETH_WETH_STABLE_BPT,
    underlying: WSTETH_WETH_STABLE_BPT,
    name: "wstETH/WETH Stable LP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "ethereum",
      "0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080",
      "wstETH/WETH Stable LP",
      WSTETH_WETH_STABLE_BPT
    ),
  },
  {
    symbol: assetSymbols.WSTETH_RETH_FRXETH_STABLE_BPT,
    underlying: WSTETH_RETH_FRXETH_STABLE_BPT,
    name: "wstETH/rETH/frxETH Stable LP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "ethereum",
      "0x5aee1e99fe86960377de9f88689616916d5dcabe000000000000000000000467",
      "wstETH/rETH/frxETH Stable LP",
      WSTETH_RETH_FRXETH_STABLE_BPT
    ),
  },
  {
    symbol: assetSymbols.WSTETH_RETH_FRXETH_STABLE_BPT,
    underlying: WSTETH_RETH_FRXETH_STABLE_BPT,
    name: "wstETH/rETH/frxETH Stable LP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "ethereum",
      "0x5aee1e99fe86960377de9f88689616916d5dcabe000000000000000000000467",
      "wstETH/rETH/frxETH Stable LP",
      WSTETH_RETH_FRXETH_STABLE_BPT
    ),
  },
  {
    symbol: assetSymbols.WBETH_WSTETH_STABLE_BPT,
    underlying: WBETH_WSTETH_STABLE_BPT,
    name: "wBETH/wstETH Stable LP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "ethereum",
      "0x2e848426aec6dbf2260535a5bea048ed94d9ff3d000000000000000000000536",
      "wBETH/wstETH Stable LP",
      WBETH_WSTETH_STABLE_BPT
    ),
  },
  {
    symbol: assetSymbols.WSTETH_CBETH_STABLE_BPT,
    underlying: WSTETH_CBETH_STABLE_BPT,
    name: "wstETH/cbETH Stable LP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "ethereum",
      "0x9c6d47ff73e0f5e51be5fd53236e3f595c5793f200020000000000000000042c",
      "wstETH/cbETH Stable LP",
      WSTETH_CBETH_STABLE_BPT
    ),
  },
  {
    symbol: assetSymbols.OHM50_DAI50_BPT,
    underlying: OHM50_DAI50_BPT,
    name: "OHM50/DAI50 Weighed LP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpTokenPriceOracle,
    extraDocs: balancerDocs(
      "ethereum",
      "0x76fcf0e8c7ff37a47a799fa2cd4c13cde0d981c90002000000000000000003d2",
      "OHM50/DAI50 Weighed LP",
      OHM50_DAI50_BPT
    ),
  },
  {
    symbol: assetSymbols.OHM50_WETH50_BPT,
    underlying: OHM50_WETH50_BPT,
    name: "OHM50/WETH50 Weighed LP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpTokenPriceOracle,
    extraDocs: balancerDocs(
      "ethereum",
      "0xd1ec5e215e8148d76f4460e4097fd3d5ae0a35580002000000000000000003d3",
      "OHM50/WETH50 Weighed LP",
      OHM50_WETH50_BPT
    ),
  },
  {
    symbol: assetSymbols.AAVE_LINEAR_WETH,
    underlying: AAVE_LINEAR_WETH,
    name: "bb-a-WETH Linear BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpLinearPoolPriceOracle,
    extraDocs: "",
    disabled: true,
  },
  {
    symbol: assetSymbols.AAVE_LINEAR_USDT,
    underlying: AAVE_LINEAR_USDT,
    name: "bb-a-USDT Linear BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpLinearPoolPriceOracle,
    extraDocs: "",
    disabled: true,
  },
  {
    symbol: assetSymbols.AAVE_LINEAR_USDC,
    underlying: AAVE_LINEAR_USDC,
    name: "bb-a-USDC Linear BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpLinearPoolPriceOracle,
    extraDocs: "",
    disabled: true,
  },
  {
    symbol: assetSymbols.AAVE_LINEAR_DAI,
    underlying: AAVE_LINEAR_DAI,
    name: "bb-a-DAI Linear BLP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpLinearPoolPriceOracle,
    extraDocs: "",
    disabled: true,
  },
  {
    symbol: assetSymbols.AAVE_BOOSTED_STABLE_BPT,
    underlying: AAVE_BOOSTED_STABLE_BPT,
    name: "AAVE Boosted Stable LP",
    decimals: 18,
    oracle: OracleTypes.BalancerLpStablePoolPriceOracle,
    extraDocs: balancerDocs(
      "ethereum",
      "0xfebb0bbf162e64fb9d0dfe186e517d84c395f016000000000000000000000502",
      "AAVE Boosted Stable LP",
      AAVE_BOOSTED_STABLE_BPT
    ),
  },
];

export default assets;
