import { assetSymbols, DeployedPlugins, underlying } from "@midas-capital/types";

import assets from "./assets";

const deployedPlugins: DeployedPlugins = {
  "0xB6a8f36746BcCC1025Ec54eb2c6DCEF8EeE8df2f": {
    market: "0x6dDF9A3b2DE1300bB2B99277716e4E574DB3a871",
    name: "Beefy EURE-jEUR Vault",
    strategy: "BeefyERC4626",
    apyDocsUrl: "https://app.beefy.com/vault/jarvis-2eure",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["EURE-JEUR"]),
    otherParams: ["0x58a3e6d5501180fb9fcE7cFC2368F9Dc5e186A6f", "10"],
  },
  "0x6578e774120F6010315784C69C634bF3946AFb0c": {
    market: "0x9b5D86F4e7A45f4b458A2B673B4A3b43D15428A7",
    name: "Beefy agEUR-jEUR Vault",
    strategy: "BeefyERC4626",
    apyDocsUrl: "https://app.beefy.com/vault/jarvis-2eur",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["AGEUR-JEUR"]),
    otherParams: ["0x5F1b5714f30bAaC4Cb1ee95E1d0cF6d5694c2204", "10"],
  },
  "0x74bA0D32B7430a2aad36e48B7aAD57bf233bDDa6": {
    market: "0xCC7eab2605972128752396241e46C281e0405a27",
    name: "Beefy jEUR-PAR Vault",
    strategy: "BeefyERC4626",
    apyDocsUrl: "https://app.beefy.com/vault/jarvis-2eurp",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JEUR-PAR"]),
    otherParams: ["0xfE1779834EaDD60660a7F3f576448D6010f5e3Fc", "0"],
  },
  "0xCC9083ad35bd9d55eF9D4cB4C2A6e879fB70fdc1": {
    market: "0x1792046890b99ae36756Fd00f135dc5F80D41dfA",
    name: "Beefy jJPY-JPYC Vault",
    strategy: "BeefyERC4626",
    apyDocsUrl: "https://app.beefy.com/vault/jarvis-2jpy2",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JJPY-JPYC"]),
    otherParams: ["0x122E09FdD2FF73C8CEa51D432c45A474BAa1518a", "10"],
  },
  "0x742EF90E1828FCEec848c8FB548d45Eaaf17B56d": {
    market: "0x17A6922ADE40e8aE783b0f6b8931Faeca4a5A264",
    name: "Beefy jCAD-CADC Vault",
    strategy: "BeefyERC4626",
    apyDocsUrl: "https://app.beefy.com/vault/jarvis-2cad",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JCAD-CADC"]),
    otherParams: ["0xcf9Dd1de1D02158B3d422779bd5184032674A6D1", "10"],
  },
  "0x05fCE131DA43e7Be1cdDda3137f402034a5232fc": {
    market: "0x41EDdba1e19fe301A067b2726DF5a3332DD02D6A",
    name: "Beefy jSGD-XSGD Vault",
    strategy: "BeefyERC4626",
    apyDocsUrl: "https://app.beefy.com/vault/jarvis-2sgd",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JSGD-XSGD"]),
    otherParams: ["0x18DAdac6d0AAF37BaAAC811F6338427B46815a81", "10"],
  },
  "0xd2C9a07710e04d7d175c55fDE0be026194D1e666": {
    market: "0xB3eAb218a7e3A68Dc5020fC1c0F7f0e3214a8bAE",
    name: "Beefy jEUR-EURt Vault",
    strategy: "BeefyERC4626",
    apyDocsUrl: "https://app.beefy.com/vault/jarvis-2eurt",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JEUR-EURT"]),
    otherParams: ["0x26B7d2fe697e932907175A3920B5dC2C2e2440A4", "10"],
  },
  "0xE5dE7E6Bb9F2ca5058aF4037E518654B4868b223": {
    market: "0x7AB807F3FBeca9eb22a1A7a490bdC353D85DED41",
    name: "Beefy jNZD-NZDS Vault",
    strategy: "BeefyERC4626",
    apyDocsUrl: "https://app.beefy.com/vault/jarvis-2nzd",
    strategyDocsUrl: "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/polygon/jarvis-jfiat-pool",
    underlying: underlying(assets, assetSymbols["JNZD-NZDS"]),
    otherParams: ["0x6720C2b7fd7dE1CAD3242dd3E8a86d033D4ed3f9", "10"],
  },
  "0x00522B12FB53803041AF948eCfB5CC81477CEB04": {
    market: "0xa5A14c3814d358230a56e8f011B8fc97A508E890",
    name: "Arrakis PAR-USDC Vault",
    strategy: "ArrakisERC4626",
    underlying: underlying(assets, assetSymbols["arrakis_USDC_PAR_005"]),
    otherParams: [
      "0x5fF63E442AC4724EC342f4a3d26924233832EcBB", // _flywheel
      "0x528330fF7c358FE1bAe348D23849CCed8edA5917", // IGuniPool _pool
      "0xa5A14c3814d358230a56e8f011B8fc97A508E890", // _rewardsDestination
      ["0xADAC33f543267c4D59a8c299cF804c303BC3e4aC"], // _rewardTokens
    ],
  },
};

export default deployedPlugins;
