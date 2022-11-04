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
  },
  // no plugin deployment file stored
  "0x46eC3122C73CA62A18FFCFd434cDc1C341Fe96dB": {
    market: "0x32Be4b977BaB44e9146Bb414c18911e652C56568",
    name: "GLMR-xc.DOT",
    strategy: Strategy.Stella,
    apyDocsUrl: "https://app.stellaswap.com/farm",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/moonbeam/stellaswap",
    underlying: underlying(assets, assetSymbols["WGLMR-xcDOT"]),
    otherParams: [
      "0xF3a5454496E26ac57da879bf3285Fa85DEBF0388",
      "10",
      "0x32Be4b977BaB44e9146Bb414c18911e652C56568",
      [underlying(assets, assetSymbols.STELLA), underlying(assets, assetSymbols.WGLMR)],
    ],
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
  },
};

export default deployedPlugins;
