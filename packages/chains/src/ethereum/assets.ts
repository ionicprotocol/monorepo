import { assetSymbols, OracleTypes, SupportedAsset, SupportedChains } from "@midas-capital/types";

import { balancerDocs, defaultDocs, sommFinanceMainnetDocs, wrappedAssetDocs } from "../common";

export const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const BAL = "0xba100000625a3754423978a60c9317c58a424e3D";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const PAR = "0x68037790A0229e9Ce6EaA8A99ea92964106C4703";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const GOHM = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
const FRAX = "0x853d955aCEf822Db058eb8505911ED77F175b99e";
const MIM = "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3";
const wstETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const stETH = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";
const swETH = "0xf951E335afb289353dc249e82926178EaC7DEd78";
const cbETH = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
// const ankrETH = "0xE95A203B1a91a908F9B9CE46459d101078c2c3cb";
const rETH = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const ANKR = "0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4";

// Balancer
const SWETH_BBA_WETH_BPT = "0x02D928E68D8F10C0358566152677Db51E1e2Dc8C";

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
    oracle: OracleTypes.ChainlinkPriceOracleV2,
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
];

export default assets;
