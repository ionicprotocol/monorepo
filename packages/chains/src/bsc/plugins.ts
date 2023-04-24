import { assetSymbols, DeployedPlugins, Strategy, underlying } from "@midas-capital/types";

import assets from "./assets";

const deployedPlugins: DeployedPlugins = {
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
      "0xAbBbAc3F07d33F7dC4dfD5EdB1E7Bf56041abBa5", // _dddFlywheel
      "0xF2E46295c684C541d618243558a0af17fb4a6862", // _epxFlywheel
      "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af", // lpDepositor
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
    underlying: underlying(assets, assetSymbols["3brl"]), // 2BRL
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
    name: "Beefy JCHF-BUSD Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/ellipsis-busd-jchf",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["3EPS"]),
    otherParams: ["0x80ACf5C89A284C4b6Fdbc851Ba9844D29d4c6BEd", "0"], // Beefy Vault, withdraw fee
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // BeefyERC4626_stkBNB-WBNB_0x906Ab4476221ADc91Dc112c25081A374E0bd29C0.json
  "0xcfB267a90974a172c38Af238b1010672DE4479Ad": {
    market: "0x906Ab4476221ADc91Dc112c25081A374E0bd29C0",
    name: "Beefy stkBNB-WBNB Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/cakev2-wbnb-stkbnb",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/pstake-pool",
    underlying: underlying(assets, assetSymbols["stkBNB-WBNB"]),
    otherParams: ["0xd23ef71883a98c55Eb7ED67ED61fABF554aDEd21", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // BeefyERC4626_3brl_0x8CE7E5A358bbb7dc49EB2bf796830Ce76A4AA63a.json
  "0xCeB429c710D523d8243833018852Bbad2CEA9Bb4": {
    market: "0x8CE7E5A358bbb7dc49EB2bf796830Ce76A4AA63a",
    name: "Beefy 3brl Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/ellipsis-3brl",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/transfero-stables-pool",
    underlying: underlying(assets, assetSymbols["3brl"]),
    otherParams: ["0xF46E3e2eb855baE2A32eD941f0c03b1D9b7b96a0", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // BeefyERC4626_epsBNBx-BNB_0x373E0F759828c891EF837b6457a0E7584107dbAb.json
  "0x643fd5AB2485dF7D9Ad43C4c210AbEc8Ae7e44D8": {
    market: "0x373E0F759828c891EF837b6457a0E7584107dbAb",
    name: "Beefy EPS BNBx/BNB  Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/ellipsis-bnb-bnbx-crypto",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/stader-bnbx-pool",
    underlying: underlying(assets, assetSymbols["epsBNBx-BNB"]),
    otherParams: ["0x56ec6031dC969CfA035F6D65e65D8595d5660fB4", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // BeefyERC4626_ApeSwap BNBx-WBNB LP_0xF0baaE2dc101e6Ff1439Ed3C9f27b30715d1E6AA.json
  "0x0b4444F3FB85264427397Fede0f94704aa3828b9": {
    market: "0xF0baaE2dc101e6Ff1439Ed3C9f27b30715d1E6AA",
    name: "Beefy ApeSwap BNBx/BNB  Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/banana-bnbx-wbnb",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/stader-bnbx-pool",
    underlying: underlying(assets, assetSymbols["asBNBx-WBNB"]),
    otherParams: ["0xC46DcDe0d91f674C04a61Bb30A52C6B45b95F317", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // BeefyERC4626_2brl_0xfB760f395E945Fd7D4AA1B22334CB1e4E6F0D19F.json
  "0xBCAc816440f7ef66Fea896b307352b86a83F94E8": {
    market: "0xfB760f395E945Fd7D4AA1B22334CB1e4E6F0D19F",
    name: "Beefy EPS 2brl  Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/ellipsis-2brl",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/transfero-stables-pool",
    underlying: underlying(assets, assetSymbols["2brl"]),
    otherParams: ["0xf867cD98F3762D899F5F26FF5Dd62A5C566A3E0C", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // BeefyERC4626_ApeSwap%20BNBx-WBNB%20LP_0xA057E4f8Ff4a9102F3ee2FF614b9cBC0286F2287.json
  "0xac99ced1a1310fB04618d4801888120ccDD7B87B": {
    market: "0xA057E4f8Ff4a9102F3ee2FF614b9cBC0286F2287",
    name: "Beefy BNBx-BNB LP Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/banana-bnbx-wbnb",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["asBNBx-WBNB"]),
    otherParams: ["0xC46DcDe0d91f674C04a61Bb30A52C6B45b95F317", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // BeefyERC4626_epsBNBx-BNB_0xD96643Ba2Bf96e73509C4bb73c0cb259dAf34de1.json
  "0xA331FaA3Bb84A70466c801E9b14523d8f15f328E": {
    market: "0xD96643Ba2Bf96e73509C4bb73c0cb259dAf34de1",
    name: "Beefy eps BNBx-BNB LP Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/ellipsis-bnb-bnbx-crypto",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["epsBNBx-BNB"]),
    otherParams: ["0x56ec6031dC969CfA035F6D65e65D8595d5660fB4", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // BeefyERC4626_valdai3EPS_0xBEE206C085f228674a2273F8A33ceaD9e34c3d48.json
  "0x7B77E7713FB2950326B0dE483852da0e1d975d4C": {
    market: "0xBEE206C085f228674a2273F8A33ceaD9e34c3d48",
    name: "Beefy valdai 3EPS LP Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/ellipsis-valdai3eps",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols.valdai3EPS),
    otherParams: ["0x047d08f4eFB9a0BC166447A12326d39A5167138f", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // BeefyERC4626_mai3EPS_0xcB710DD270fa9d57edFadD141BAF3efC0f776716.json
  "0xDE1A82D80082e6b6E9cbe70002857716A09EA18b": {
    market: "0xcB710DD270fa9d57edFadD141BAF3efC0f776716",
    name: "Beefy mai3EPS LP Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/ellipsis-mai",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols.mai3EPS),
    otherParams: ["0xc1beA7B6b749D1f3A812F39afeB8795a97402dfF", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // HelioERC4626_HAY_0xAB7d4760E2c54c0Da1efEC7C358F171d72e14153.json
  "0x369ddC01E8feF7350Eb740f4a32647E8640F0A17": {
    market: "0xAB7d4760E2c54c0Da1efEC7C358F171d72e14153",
    name: "HAY Staking Vault",
    strategy: Strategy.HelioHAY,
    apyDocsUrl: "https://helio.money/app/earn",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols.mai3EPS),
    otherParams: ["0x0a1Fd12F73432928C190CAF0810b3B767A59717e"], // JAR
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/helio.png",
  },
  // BeefyERC4626_sAMM-jBRL-BRZ_0x9C170d5c6264b04419a06492bf4FbC65ecd63f4D.json
  "0x33395bbe8fcA14368003f9aCE2Deb0Ba5103c670": {
    market: "0x9C170d5c6264b04419a06492bf4FbC65ecd63f4D",
    name: "Beefy sAMM jBRL-BRZ LP Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/thena-jbrl-brz",
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/transfero-stables-pool",
    underlying: underlying(assets, assetSymbols["sAMM-jBRL/BRZ"]),
    otherParams: ["0xb36fffD0174B2eC18D82d21BB2e24b132ecBA5b0", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png",
  },
  // ThenaLpERC4626_vAMM-HAY-ankrBNB_0x04b6895d7AD8b10a1a13C749159226249a3b8515
  "0xE141ce7507656f9b2c45d06d649961Eb84e19f82": {
    market: "0x04b6895d7AD8b10a1a13C749159226249a3b8515",
    name: "Thena vAMM-HAY-ankrBNB LP Vault",
    strategy: Strategy.ThenaERC4626,
    apyDocsUrl: `https://www.thena.fi/liquidity/manage/${underlying(assets, assetSymbols["vAMM-HAY/ankrBNB"])}`,
    otherParams: [],
    underlying: underlying(assets, assetSymbols["vAMM-HAY/ankrBNB"]),
    flywheel: "0x9f21e2bE2dD52083A5DA90a2BEe817d9F8228A74",
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/thena.png",
  },
  // ThenaLpERC4626_vAMM-ANKR-HAY_0xbc65FE441545E9e8f97E50F70526B7E8963826bc.json
  "0x52156377Dbe031706cfAb4e759cA102e58A19953": {
    market: "0xbc65FE441545E9e8f97E50F70526B7E8963826bc",
    name: "Thena vAMM-ANKR-HAY LP Vault",
    strategy: Strategy.ThenaERC4626,
    apyDocsUrl: `https://www.thena.fi/liquidity/manage/${underlying(assets, assetSymbols["vAMM-ANKR/HAY"])}`,
    otherParams: [],
    underlying: underlying(assets, assetSymbols["vAMM-ANKR/HAY"]),
    flywheel: "0x9f21e2bE2dD52083A5DA90a2BEe817d9F8228A74",
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/thena.png",
  },
  // ThenaLpERC4626_vAMM-ANKR-ankrBNB_0x71693C84486B37096192c9942852f542543639Bf.json
  "0x0c0e8ED68a72c31E657Ce5F03A615FB96753C9b5": {
    market: "0x71693C84486B37096192c9942852f542543639Bf",
    name: "Thena vAMM-ANKR-ankrBNB LP Vault",
    strategy: Strategy.ThenaERC4626,
    apyDocsUrl: `https://www.thena.fi/liquidity/manage/${underlying(assets, assetSymbols["vAMM-ANKR/ankrBNB"])}`,
    otherParams: [],
    underlying: underlying(assets, assetSymbols["vAMM-ANKR/ankrBNB"]),
    flywheel: "0x9f21e2bE2dD52083A5DA90a2BEe817d9F8228A74",
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/thena.png",
  },
  // ThenaLpERC4626_sAMM-HAY-BUSD_0xF8527Dc5611B589CbB365aCACaac0d1DC70b25cB.json
  "0x02706A482fc9f6B20238157B56763391a45bE60E": {
    market: "0xF8527Dc5611B589CbB365aCACaac0d1DC70b25cB",
    name: "Thena sAMM-HAY-BUSD LP Vault",
    strategy: Strategy.ThenaERC4626,
    apyDocsUrl: `https://www.thena.fi/liquidity/manage/${underlying(assets, assetSymbols["sAMM-HAY/BUSD"])}`,
    otherParams: [],
    underlying: underlying(assets, assetSymbols["sAMM-HAY/BUSD"]),
    flywheel: "0x9f21e2bE2dD52083A5DA90a2BEe817d9F8228A74",
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/thena.png",
  },
};

export default deployedPlugins;
