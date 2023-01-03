import { assetSymbols, DeployedPlugins, Strategy, underlying } from "@midas-capital/types";

import assets from "./assets";

const deployedPlugins: DeployedPlugins = {
  // no plugin deployment file stored
  "0x0DaFF7aaaE63F1Fc30c1C40816257513D052b649": {
    market: "0x85Ff07b5F3454143531F36Bd6bEd92654d0681eD",
    name: "GLMR-ATOM",
    strategy: Strategy.Stella,
    apyDocsUrl: "https://app.stellaswap.com/farm",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/moonbeam/stellaswap",
    underlying: underlying(assets, assetSymbols["ATOM-GLMR"]),
    otherParams: [
      "0xF3a5454496E26ac57da879bf3285Fa85DEBF0388",
      "5",
      "0x85Ff07b5F3454143531F36Bd6bEd92654d0681eD",
      [underlying(assets, assetSymbols.STELLA), underlying(assets, assetSymbols.WGLMR)],
    ],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/stella.png",
  },
  // CurveGaugeERC4626_xcDOT-stDOT_0xe4C6Bd326a1715cEbFeD3647A963a308Ae7F8A98.json
  "0xE9c4274341ab4Be0857476e84963b3c36787568D": {
    market: "0xe4C6Bd326a1715cEbFeD3647A963a308Ae7F8A98",
    name: "Curve xcDOT-stDOT Gauge",
    strategy: Strategy.CurveGauge,
    apyDocsUrl: "https://moonbeam.curve.fi/",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/moonbeam/xcdot",
    underlying: underlying(assets, assetSymbols["xcDOT-stDOT"]),
    otherParams: ["0xC106C836771B0B4f4a0612Bd68163Ca93be1D340", [underlying(assets, assetSymbols["xcDOT-stDOT"])]],
    flywheel: "0xb13aAD1F212FdE08a5ab51249cf6434574434A4e",
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/curve.png",
  },
  // StellaLpERC4626_USDC.wh-GLMR_0xeB7b975C105f05bFb02757fB9bb3361D77AAe84Ajson
  "0x7EbB783fA23b731c76017bB0656530337Ed31577": {
    market: "0xeB7b975C105f05bFb02757fB9bb3361D77AAe84A",
    name: "StellaSwap USDC.wh-GLMR Pool",
    strategy: Strategy.Stella,
    apyDocsUrl: "https://app.stellaswap.com/farm",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/moonbeam/stellaswap",
    underlying: underlying(assets, assetSymbols["USDC.wh-GLMR"]),
    otherParams: ["0xF3a5454496E26ac57da879bf3285Fa85DEBF0388", "28"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/stella.png",
  },
  // StellaLpERC4626_WETH.wh-GLMR_0x95b1eFbd91E35FdAE0720d1BeDA3d4d1fbfefa1C.json
  "0x2a7A88544270bbD181E147B1A1d88d0A78186dA6": {
    market: "0x95b1eFbd91E35FdAE0720d1BeDA3d4d1fbfefa1C",
    name: "StellaSwap WETH.wh-GLMR Pool",
    strategy: Strategy.Stella,
    apyDocsUrl: "https://app.stellaswap.com/farm",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/moonbeam/stellaswap",
    underlying: underlying(assets, assetSymbols["WETH.wh-GLMR"]),
    otherParams: ["0xF3a5454496E26ac57da879bf3285Fa85DEBF0388", "28"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/stella.png",
  },
  // StellaLpERC4626_WBTC.wh-GLMR_0xD7ee88664C269Ec834a471cf47C576B6203cdC45.json
  "0x5BF5B16130B90fB636A3b8a136da3944BAACaCAC": {
    market: "0xD7ee88664C269Ec834a471cf47C576B6203cdC45",
    name: "StellaSwap WBTC.wh-GLMR Pool",
    strategy: Strategy.Stella,
    apyDocsUrl: "https://app.stellaswap.com/farm",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/moonbeam/stellaswap",
    underlying: underlying(assets, assetSymbols["WBTC.wh-GLMR"]),
    otherParams: ["0xF3a5454496E26ac57da879bf3285Fa85DEBF0388", "30"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/stella.png",
  },
  // StellaLpERC4626_DOT.xc-GLMR_0xe2b3FC05C0c90c38BCa6E149D186571D413F5f5A.json
  "0xe32f52f8172E3c75dacB3606e254275ab774d88f": {
    market: "0xe2b3FC05C0c90c38BCa6E149D186571D413F5f5A",
    name: "StellaSwap DOT.xc-GLMR Pool",
    strategy: Strategy.Stella,
    apyDocsUrl: "https://app.stellaswap.com/farm",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/moonbeam/stellaswap",
    underlying: underlying(assets, assetSymbols["DOT.xc-GLMR"]),
    otherParams: ["0xF3a5454496E26ac57da879bf3285Fa85DEBF0388", "10"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/stella.png",
  },
};

export default deployedPlugins;
