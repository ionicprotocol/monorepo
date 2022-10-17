import { assetSymbols, DeployedPlugins, Strategy, underlying } from "@midas-capital/types";

import assets from "./assets";

const deployedPlugins: DeployedPlugins = {
  // No plugin deployment file stored
  "0x10C90bfCFb3D2A7ae814dA1548ae3a7fC31C35A0": {
    market: "0x34ea4cbb464E6D120B081661464d4635Ca237FA7",
    name: "Bomb",
    strategy: Strategy.Bomb,
    apyDocsUrl: "https://www.bomb.farm/#/bsc/vault/bomb-bomb",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/bomb",
    underlying: underlying(assets, assetSymbols.BOMB), // BOMB
    otherParams: ["0xAf16cB45B8149DA403AF41C63AbFEBFbcd16264b"], // xBOMB
  },
  // No plugin deployment file stored
  "0x6B8B935dfC9Dcd0754eced708b1b633BF73FE854": {
    market: "0x4cF3D3ca995beEeEd83f67A5C0456A13e038f7b8",
    name: "BTCB-BOMB",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://www.bomb.farm/#/bsc/vault/bomb-bomb-btcb",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/bomb",
    underlying: underlying(assets, assetSymbols["BTCB-BOMB"]), // BOMB
    otherParams: ["0x94E85B8E050F3F281CB9597cc0144F1F7AF1fe9B", "10"], // beefy vault, withdrawal fee
  },
  // DotDotLpERC4626_2brl_0xf0a2852958aD041a9Fb35c312605482Ca3Ec17ba.json
  "0x23bBcF59BF843cD55c4DA9bDB81429695C87f847": {
    market: "0xf0a2852958aD041a9Fb35c312605482Ca3Ec17ba",
    name: "2brl DotDotLpERC4626",
    strategy: Strategy.DotDot,
    apyDocsUrl: "https://dotdot.finance/#/stake",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["2brl"]), // 2BRL
    otherParams: [
      "0xD146adB6B07c7a31174FFC8B001dCa7AAF8Ff9E0", // _dddFlywheel
      "0x89293CeaE1822CE4d5510d3Dd8248F6552FB60F4", // _epxFlywheel
      "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1aff", // lpDepositor
      "0xf0a2852958aD041a9Fb35c312605482Ca3Ec17ba", // _rewardsDestination
      [underlying(assets, assetSymbols.DDD), underlying(assets, assetSymbols.EPX)], // _rewardTokens
    ],
  },
  // No plugin deployment file stored
  "0xBE0cCFA6B09eB1f3C0c62D406aE00F528e20594b": {
    market: "0x383158Db17719d2Cf1Ce10Ccb9a6Dd7cC1f54EF3",
    name: "3brl DotDotLpERC4626",
    strategy: Strategy.DotDot,
    apyDocsUrl: "https://dotdot.finance/#/stake",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["2brl"]), // 2BRL
    otherParams: [
      "0xD146adB6B07c7a31174FFC8B001dCa7AAF8Ff9E0", // _dddFlywheel
      "0x89293CeaE1822CE4d5510d3Dd8248F6552FB60F4", // _epxFlywheel
      "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", // lpDepositor
      "0x383158Db17719d2Cf1Ce10Ccb9a6Dd7cC1f54EF3", // _rewardsDestination
      [underlying(assets, assetSymbols.DDD), underlying(assets, assetSymbols.EPX)], // _rewardTokens
    ],
  },
  // DotDotLpERC4626_val3EPS_0xccc9BEF35C50A3545e01Ef72Cc957E0aec8B2e7C.json
  "0xe38A0F34DB15fCC47510cdB0519E149eC20c8806": {
    market: "0xccc9BEF35C50A3545e01Ef72Cc957E0aec8B2e7C",
    name: "val3EPS DotDotLpERC4626",
    strategy: Strategy.DotDot,
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
  // DotDotLpERC4626_valdai3EPS_0x7479dd29b9256aB74c9bf84d6f9CE6e30014d248.json
  "0xc2Af1451dBFbf564FB32E57f275d419395F5BC92": {
    market: "0x7479dd29b9256aB74c9bf84d6f9CE6e30014d248",
    name: "valdai3EPS DotDotLpERC4626",
    strategy: Strategy.DotDot,
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
  // DotDotLpERC4626_3EPS_0x6f9B6ccD027d1c6Ed09ee215B9Ca5B85a57C6eA1
  "0x628C6d2236fC1712D66Df5fbFf9041f7809C959C": {
    market: "0x6f9B6ccD027d1c6Ed09ee215B9Ca5B85a57C6eA1",
    name: "3EPS DotDotLpERC4626",
    strategy: Strategy.DotDot,
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
  // BeefyERC4626_jCHF-BUSD_0x1F0452D6a8bb9EAbC53Fa6809Fa0a060Dd531267.json
  "0x29b2aB4102d7aF1CDCF9c84D29D18dC2cFf11f1A": {
    market: "0x1F0452D6a8bb9EAbC53Fa6809Fa0a060Dd531267",
    name: "JCHF-BUSD",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/ellipsis-busd-jchf",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["3EPS"]),
    otherParams: ["0x80ACf5C89A284C4b6Fdbc851Ba9844D29d4c6BEd", "0"], // Beefy Vault, withdraw fee
  },
  // BeefyERC4626_stkBNB-WBNB_0x906Ab4476221ADc91Dc112c25081A374E0bd29C0.json
  "0xcfB267a90974a172c38Af238b1010672DE4479Ad": {
    market: "0x906Ab4476221ADc91Dc112c25081A374E0bd29C0",
    name: "Beefy stkBNB-WBNB Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.com/vault/cakev2-wbnb-stkbnb",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/pstake-pool",
    underlying: underlying(assets, assetSymbols["stkBNB-WBNB"]),
    otherParams: ["0xd23ef71883a98c55Eb7ED67ED61fABF554aDEd21", "0"],
  },
};

export default deployedPlugins;
