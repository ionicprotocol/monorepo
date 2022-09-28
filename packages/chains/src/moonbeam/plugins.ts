import { assetSymbols, DeployedPlugins, underlying } from "@midas-capital/types";

import assets from "./assets";

const deployedPlugins: DeployedPlugins = {
  "0x0DaFF7aaaE63F1Fc30c1C40816257513D052b649": {
    market: "0x85Ff07b5F3454143531F36Bd6bEd92654d0681eD",
    name: "GLMR-ATOM",
    strategy: "StellaLpERC4626",
    apyDocsUrl: "https://app.stellaswap.com/farm",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/moonbeam-coming-soon",
    underlying: underlying(assets, assetSymbols["ATOM-GLMR"]),
    otherParams: [
      "0xF3a5454496E26ac57da879bf3285Fa85DEBF0388",
      "5",
      "0x85Ff07b5F3454143531F36Bd6bEd92654d0681eD",
      [underlying(assets, assetSymbols.STELLA), underlying(assets, assetSymbols.WGLMR)],
    ],
  },
  "0x46eC3122C73CA62A18FFCFd434cDc1C341Fe96dB": {
    market: "0x32Be4b977BaB44e9146Bb414c18911e652C56568",
    name: "GLMR-xc.DOT",
    strategy: "StellaLpERC4626",
    apyDocsUrl: "https://app.stellaswap.com/farm",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/moonbeam-coming-soon",
    underlying: underlying(assets, assetSymbols["WGLMR-xcDOT"]),
    otherParams: [
      "0xF3a5454496E26ac57da879bf3285Fa85DEBF0388",
      "10",
      "0x32Be4b977BaB44e9146Bb414c18911e652C56568",
      [underlying(assets, assetSymbols.STELLA), underlying(assets, assetSymbols.WGLMR)],
    ],
  },
};

export default deployedPlugins;
