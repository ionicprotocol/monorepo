import { assetSymbols, DeployedPlugins, underlying } from "@midas-capital/types";

import assets from "./assets";

const deployedPlugins: DeployedPlugins = {
  "0x10C90bfCFb3D2A7ae814dA1548ae3a7fC31C35A0": {
    market: "0x34ea4cbb464E6D120B081661464d4635Ca237FA7",
    name: "Bomb",
    strategy: "BombERC4626",
    apyDocsUrl: "https://www.bomb.farm/#/bsc/vault/bomb-bomb",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/bomb",
    underlying: underlying(assets, assetSymbols.BOMB), // BOMB
    otherParams: ["0xAf16cB45B8149DA403AF41C63AbFEBFbcd16264b"], // xBOMB
  },
  "0x6B8B935dfC9Dcd0754eced708b1b633BF73FE854": {
    market: "0x4cF3D3ca995beEeEd83f67A5C0456A13e038f7b8",
    name: "BTCB-BOMB",
    strategy: "BeefyERC4626",
    apyDocsUrl: "https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/bomb",
    underlying: underlying(assets, assetSymbols["BTCB-BOMB"]), // BOMB
    otherParams: ["0x94E85B8E050F3F281CB9597cc0144F1F7AF1fe9B", "10"], // beefy vault, withdrawal fee
  },
  "0x3c29e9b0CfE6FfF97f373eAbEADE9475FaC3bd4e": {
    market: "0xf0a2852958aD041a9Fb35c312605482Ca3Ec17ba",
    name: "2brl DotDotLpERC4626",
    strategy: "DotDotLpERC4626",
    apyDocsUrl: "https://dotdot.finance/#/stake",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["2brl"]), // 2BRL
    otherParams: [
      "0xD146adB6B07c7a31174FFC8B001dCa7AAF8Ff9E0", // _dddFlywheel
      "0x89293CeaE1822CE4d5510d3Dd8248F6552FB60F4", // _epxFlywheel
      "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", // lpDepositor
      "0xf0a2852958aD041a9Fb35c312605482Ca3Ec17ba", // _rewardsDestination
      [underlying(assets, assetSymbols.DDD), underlying(assets, assetSymbols.EPX)], // _rewardTokens
    ],
  },
  "0x9dB349BbfF9E177dB4bd3134ff93876688b77835": {
    market: "0xccc9BEF35C50A3545e01Ef72Cc957E0aec8B2e7C",
    name: "val3EPS DotDotLpERC4626",
    strategy: "DotDotLpERC4626",
    apyDocsUrl: "https://dotdot.finance/#/stake",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/ellipsis-x-dotdot",
    underlying: underlying(assets, assetSymbols.val3EPS),
    otherParams: [
      "0xD146adB6B07c7a31174FFC8B001dCa7AAF8Ff9E0", // _dddFlywheel
      "0x89293CeaE1822CE4d5510d3Dd8248F6552FB60F4", // _epxFlywheel
      "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", // lpDepositor
      "0xccc9BEF35C50A3545e01Ef72Cc957E0aec8B2e7C", // _rewardsDestination
      [underlying(assets, assetSymbols.DDD), underlying(assets, assetSymbols.EPX)], // _rewardTokens
    ],
  },
  "0xBb6729e250Ff6b1BB2917bC65817731E98157B1F": {
    market: "0x7479dd29b9256aB74c9bf84d6f9CE6e30014d248",
    name: "valdai3EPS DotDotLpERC4626",
    strategy: "DotDotLpERC4626",
    apyDocsUrl: "https://dotdot.finance/#/stake",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/ellipsis-x-dotdot",
    underlying: underlying(assets, assetSymbols.valdai3EPS),
    otherParams: [
      "0xD146adB6B07c7a31174FFC8B001dCa7AAF8Ff9E0", // _dddFlywheel
      "0x89293CeaE1822CE4d5510d3Dd8248F6552FB60F4", // _epxFlywheel
      "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", // lpDepositor
      "0x7479dd29b9256aB74c9bf84d6f9CE6e30014d248", // _rewardsDestination
      [underlying(assets, assetSymbols.DDD), underlying(assets, assetSymbols.EPX)], // _rewardTokens
    ],
  },
  "0xcc1602fBeceb5C4C53DA29B60342822C753652E8": {
    market: "0x6f9B6ccD027d1c6Ed09ee215B9Ca5B85a57C6eA1",
    name: "3EPS DotDotLpERC4626",
    strategy: "DotDotLpERC4626",
    apyDocsUrl: "https://dotdot.finance/#/stake",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/ellipsis-x-dotdot",
    underlying: underlying(assets, assetSymbols["3EPS"]),
    otherParams: [
      "0xD146adB6B07c7a31174FFC8B001dCa7AAF8Ff9E0", // _dddFlywheel
      "0x89293CeaE1822CE4d5510d3Dd8248F6552FB60F4", // _epxFlywheel
      "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", // lpDepositor
      "0x6f9B6ccD027d1c6Ed09ee215B9Ca5B85a57C6eA1", // _rewardsDestination
      [underlying(assets, assetSymbols.DDD), underlying(assets, assetSymbols.EPX)],
    ],
  },
};

export default deployedPlugins;
