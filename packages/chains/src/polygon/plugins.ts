import { assetSymbols, DeployedPlugins, Strategy, underlying } from "@ionicprotocol/types";

import assets from "./assets";

const deployedPlugins: DeployedPlugins = {
  // BeefyERC4626_EURE-jEUR_0x6dDF9A3b2DE1300bB2B99277716e4E574DB3a871.json
  "0xB6a8f36746BcCC1025Ec54eb2c6DCEF8EeE8df2f": {
    // still the same, failing to change to new 0x43fa05d9D56c44d7a697Ac458CC16707A545183B
    market: "0x6dDF9A3b2DE1300bB2B99277716e4E574DB3a871",
    name: "Beefy EURE-jEUR Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/jarvis-2eure",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["EURE-JEUR"]),
    otherParams: ["0x58a3e6d5501180fb9fcE7cFC2368F9Dc5e186A6f", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_agEUR-jEUR_0x9b5D86F4e7A45f4b458A2B673B4A3b43D15428A7.json
  "0x509d5070088d1F789cD6BeAA88055ac93fF9bCeB": {
    market: "0x9b5D86F4e7A45f4b458A2B673B4A3b43D15428A7",
    name: "Beefy agEUR-jEUR Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/jarvis-2eur",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["AGEUR-JEUR"]),
    otherParams: ["0x5F1b5714f30bAaC4Cb1ee95E1d0cF6d5694c2204", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_jEUR-PAR_0xCC7eab2605972128752396241e46C281e0405a27.json
  "0x9F82D802FB4940743C543041b86220A9096A7522": {
    market: "0xCC7eab2605972128752396241e46C281e0405a27",
    name: "Beefy jEUR-PAR Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/jarvis-2eurp",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JEUR-PAR"]),
    otherParams: ["0xfE1779834EaDD60660a7F3f576448D6010f5e3Fc", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_jJPY-JPYC_0x1792046890b99ae36756Fd00f135dc5F80D41dfA.json
  "0xcDb7D4f4Dbe0DDd09F1De16aaA2eEcA6a590F725": {
    market: "0x1792046890b99ae36756Fd00f135dc5F80D41dfA",
    name: "Beefy jJPY-JPYC Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/jarvis-2jpy2",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JJPY-JPYC"]),
    otherParams: ["0x122E09FdD2FF73C8CEa51D432c45A474BAa1518a", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_jCAD-CADC_0x17A6922ADE40e8aE783b0f6b8931Faeca4a5A264.json
  "0x0FbFc75E7FAcEb8453f8F0F6938c4898C9Fcdcbd": {
    market: "0x17A6922ADE40e8aE783b0f6b8931Faeca4a5A264",
    name: "Beefy jCAD-CADC Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/jarvis-2cad",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JCAD-CADC"]),
    otherParams: ["0xcf9Dd1de1D02158B3d422779bd5184032674A6D1", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_jSGD-XSGD_0x41EDdba1e19fe301A067b2726DF5a3332DD02D6A
  "0x8cA5151058aD6F5684287ca523194Faa79827B99": {
    market: "0x41EDdba1e19fe301A067b2726DF5a3332DD02D6A",
    name: "Beefy jSGD-XSGD Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/jarvis-2sgd",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JSGD-XSGD"]),
    otherParams: ["0x18DAdac6d0AAF37BaAAC811F6338427B46815a81", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_jEUR-EURT_0xB3eAb218a7e3A68Dc5020fC1c0F7f0e3214a8bAE.json
  "0x90721EfE6b155052b9f9E99043A43fDAB521aeC1": {
    market: "0xB3eAb218a7e3A68Dc5020fC1c0F7f0e3214a8bAE",
    name: "Beefy jEUR-EURt Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/jarvis-2eurt",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JEUR-EURT"]),
    otherParams: ["0x26B7d2fe697e932907175A3920B5dC2C2e2440A4", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // ArrakisERC4626_G-UNI USDC-PAR Vault (0.05)_0xa5A14c3814d358230a56e8f011B8fc97A508E890.json
  "0xdE58CF12595e92ebB07D664eE59A642e360bea58": {
    market: "0xa5A14c3814d358230a56e8f011B8fc97A508E890",
    name: "Arrakis PAR-USDC Vault",
    strategy: Strategy.Arrakis, // TODO should be called Mimo
    apyDocsUrl: "https://app.mimo.capital/mining",
    underlying: underlying(assets, assetSymbols["arrakis_USDC_PAR_005"]),
    otherParams: [
      "0x5fF63E442AC4724EC342f4a3d26924233832EcBB", // _flywheel
      "0x528330fF7c358FE1bAe348D23849CCed8edA5917", // IGuniPool _pool
      "0xa5A14c3814d358230a56e8f011B8fc97A508E890", // _rewardsDestination
      [underlying(assets, assetSymbols.MIMO)] // _rewardTokens
    ],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/mimo.png"
  },
  // ArrakisERC4626_MIMO80-PAR20 BLP_0x82d7f08026e21c7713CfAd1071df7C8271B17Eae.json
  "0xd682451F627d54cfdA74a80972aDaeF133cdc15e": {
    market: "0xcb67Bd2aE0597eDb2426802CdF34bb4085d9483A",
    name: "Balancer LP MIMO80-PAR20",
    strategy: Strategy.Arrakis, // TODO should be called Mimo
    apyDocsUrl: "https://app.mimo.capital/mining",
    underlying: underlying(assets, assetSymbols.MIMO_PAR_80_20),
    otherParams: [
      "0x5fF63E442AC4724EC342f4a3d26924233832EcBB", // _flywheel
      "0xBA2D426DCb186d670eD54a759098947fad395C95", // IGuniPool _pool
      "0xcb67Bd2aE0597eDb2426802CdF34bb4085d9483A", // _rewardsDestination
      [underlying(assets, assetSymbols.MIMO)] // _rewardTokens
    ],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/mimo.png"
  },
  // BeefyERC4626_jEUR-PAR_0x30b32BbfcA3A81922F88809F53E625b5EE5286f6.json
  "0xc8E8B4A7E0F854Cf516A75fE742FC791dBec9F86": {
    market: "0x30b32BbfcA3A81922F88809F53E625b5EE5286f6",
    name: "Beefy jEUR-PAR Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/jarvis-2eurp",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/mimo-pool",
    underlying: underlying(assets, assetSymbols["JEUR-PAR"]),
    otherParams: ["0xfE1779834EaDD60660a7F3f576448D6010f5e3Fc", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // ArrakisERC4626_G-UNI USDC-PAR Vault (0.05)_0x4DED2939A2A8912E9Cc9eaEFAbECC43CC9864723.json
  "0xdF23f2E94a322685DD4E967dE6165242cf00B85B": {
    market: "0x4DED2939A2A8912E9Cc9eaEFAbECC43CC9864723",
    name: "Arrakis PAR-USDC Vault",
    strategy: Strategy.Arrakis,
    underlying: underlying(assets, assetSymbols["arrakis_USDC_PAR_005"]),
    otherParams: [
      "0x5fF63E442AC4724EC342f4a3d26924233832EcBB", // _flywheel
      "0x528330fF7c358FE1bAe348D23849CCed8edA5917", // IGuniPool _pool
      "0x4DED2939A2A8912E9Cc9eaEFAbECC43CC9864723", // _rewardsDestination
      [underlying(assets, assetSymbols.MIMO)] // _rewardTokens
    ],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/mimo.png"
  },
  // BeefyERC4626_am3CRV_0xd412eff9163742f6D3A4AD56B5C83D8864E8Ec3F.json
  "0xAe8a8253cd70A8Ad4749aAd850A99e2f30552f10": {
    market: "0xd412eff9163742f6D3A4AD56B5C83D8864E8Ec3F",
    name: "Beefy am3CRV Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/curve-am3crv",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols.am3CRV),
    otherParams: ["0xAA7C2879DaF8034722A0977f13c343aF0883E92e", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_MAI-USDC_0x9df035a2DC13ab63FcF05bb27B3722E68c7AE6b9.json
  "0x11EE50FB7DB66d044C3342546C27457f958e1ceD": {
    market: "0x9df035a2DC13ab63FcF05bb27B3722E68c7AE6b9",
    name: "Beefy am3CRV Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/mai-usdc-mimatic",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["MAI-USDC"]),
    otherParams: ["0xebe0c8d842AA5A57D7BEf8e524dEabA676F91cD1", "50"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_JEUR_PAR STABLE BLP_0x1944FA4a490f85Ed99e2c6fF9234F94DE16fdbde.json
  "0x36A297A86Eaed6aE0BaEb541F766A1675960B390": {
    market: "0x1944FA4a490f85Ed99e2c6fF9234F94DE16fdbde",
    name: "Beefy JEUR-PAR Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/balancer-jeur-par-v2",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/mimo-pool",
    underlying: underlying(assets, assetSymbols.JEUR_PAR_STABLE_BLP),
    otherParams: ["0xB476B7A027da3D9fB5A5c9CB6078A34f7289B476", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_MaticX-bba-WMATIC_0x13e763D25D78c3Fd6FEA534231BdaEBE7Fa52945.json
  "0x27569756A02Ee590306F1409821b5496A8e4B2B3": {
    market: "0x13e763D25D78c3Fd6FEA534231BdaEBE7Fa52945",
    name: "Beefy MaticX-bba-WMATIC Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/balancer-maticx-bbawmatic",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/mimo-pool",
    underlying: underlying(assets, assetSymbols.MaticX_bbaWMATIC),
    otherParams: ["0x4C98CB046c3eb7e3ae7Eb49a33D6f3386Ec2b9D9", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_StMatic-bba-WMATIC_0x6107D9186D710cA8BaC2B9b2b8b26a045D9f994b.json
  "0x6732E47b15919EaA4a876bC1007bdCa19020d4ED": {
    market: "0x6107D9186D710cA8BaC2B9b2b8b26a045D9f994b",
    name: "Dyson StMatic-bba-WMATIC Vault",
    strategy: Strategy.Dyson4626,
    apyDocsUrl: "https://app.dyson.money/#/pools?id=balancer-stmatic-bbawmatic",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/mimo-pool",
    underlying: underlying(assets, assetSymbols.StMatic_bbaWMATIC),
    otherParams: ["0x18661C2527220aBE021F5b52351d5c4210E0E2c6", "10"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/dyson.png"
  },
  // BeefyERC4626_USDR3CRV_0x24691492A0B99404F21B1509B1f41Ea3927c8Da9.json
  "0xb341c397dEe4098c53428bF4f8BC90F79BFDf4bA": {
    market: "0x24691492A0B99404F21B1509B1f41Ea3927c8Da9",
    name: "Beefy Curve.fi USDR/DAI/USDC/USDT Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/curve-poly-usdr",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/mimo-pool",
    underlying: underlying(assets, assetSymbols.USDR3CRV),
    otherParams: ["0x2520D50bfD793D3C757900D81229422F70171969", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  }
};

export default deployedPlugins;
