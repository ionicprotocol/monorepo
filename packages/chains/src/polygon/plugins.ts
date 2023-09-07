import { assetSymbols, DeployedPlugins, Strategy, underlying } from "@ionicprotocol/types";

import assets from "./assets";

const deployedPlugins: DeployedPlugins = {
  // BeefyERC4626_sAMM-DAI-USDR_0xBcE30B4D78cEb9a75A1Aa62156529c3592b3F08b.json
  "0x72c528B63Ced4a3DF5Ae6e983568566f1Ee7Ad77": {
    market: "0xBcE30B4D78cEb9a75A1Aa62156529c3592b3F08b",
    name: "Beefy USDR-DAI sLP vault Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/pearl-usdrv3-dai",
    underlying: underlying(assets, assetSymbols["sAMM-DAI/USDR"]),
    otherParams: ["0x2C6d11e756986f1537a2c71c851e9a1F7A0008b2", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_sAMM-USDC-USDR_0x83DF24fE1B1eBF38048B91ffc4a8De0bAa88b891.json
  "0xf634F01D04dA89914d03E914897eA068b3886714": {
    market: "0x83DF24fE1B1eBF38048B91ffc4a8De0bAa88b891",
    name: "Beefy USDC-USDR sLP vault Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/pearl-usdc-usdrv3",
    underlying: underlying(assets, assetSymbols["sAMM-USDC/USDR"]),
    otherParams: ["0xD74B5df80347cE9c81b91864DF6a50FfAfE44aa5", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_vAMM-MATIC-USDR_0xfacEdA4f9731797102f040380aD5e234c92d1942.json
  "0x046eBfaC5da8c603db95421861e536e3e16a86Be": {
    market: "0xfacEdA4f9731797102f040380aD5e234c92d1942",
    name: "Beefy MATIC-USDR vLP vault Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/pearl-matic-usdrv3",
    underlying: underlying(assets, assetSymbols["vAMM-MATIC/USDR"]),
    otherParams: ["0x3325a25A2608EA723cB5D72E27af65AACFfb810e", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_vAMM-wUSDR-USDR_0x06F61E22ef144f1cC4550D40ffbF681CB1C3aCAF.json
  "0x76B30142Ab37fd78bbD5214D742d9916eAA68249": {
    market: "0x06F61E22ef144f1cC4550D40ffbF681CB1C3aCAF",
    name: "Beefy WUSDR-USDR vLP vault Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/pearl-wusdr-usdrv3",
    underlying: underlying(assets, assetSymbols["vAMM-wUSDR/USDR"]),
    otherParams: ["0x67FEe70c32097c53B5aeAaCdbee7544eaE2194f8", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_vAMM-WETH-USDR_0x343D9a8D2Bc6A62390aEc764bb5b900C4B039127.json
  "0x06D929F4433825C9099D73C9F5512aD965A81c40": {
    market: "0x343D9a8D2Bc6A62390aEc764bb5b900C4B039127",
    name: "Beefy WETH-USDR vLP vault Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/pearl-usdrv3-weth",
    underlying: underlying(assets, assetSymbols["vAMM-WETH/USDR"]),
    otherParams: ["0xbfe9584228BBcB21EAA64a878c28c5cBFd0F6304", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_vAMM-WBTC-USDR_0xffc8c8d747E52fAfbf973c64Bab10d38A6902c46.json
  "0x7d2eAc8C5241DB0447Aa5509E0399B8A0c41f6D5": {
    market: "0xffc8c8d747E52fAfbf973c64Bab10d38A6902c46",
    name: "Beefy WBTC-USDR vLP vault Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/pearl-wbtc-usdrv3",
    underlying: underlying(assets, assetSymbols["vAMM-WBTC/USDR"]),
    otherParams: ["0x40c03Cd0B5D1571608D09e6279B4C63660e431F1", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_vAMM-TNGBL-USDR_0x2E870Aeee3D9d1eA29Ec93d2c0A99A4e0D5EB697.json
  "0xD1Bf0045a8f81f93B40b51C3Ccae2516e199e525": {
    market: "0x2E870Aeee3D9d1eA29Ec93d2c0A99A4e0D5EB697",
    name: "Beefy WBTC-USDR vLP vault Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/pearl-usdrv3-tngbl",
    underlying: underlying(assets, assetSymbols["vAMM-TNGBL/USDR"]),
    otherParams: ["0x614055aEC4B4248Ab64F976A9060e945D6095ff8", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_aUSDC-CASH-N_0x1D2A7078a404ab970f951d5A6dbECD9e24838FB6.json
  "0x3838a561597F9c0BEb722978F7dbDD2fbdF9dEd0": {
    market: "0x1D2A7078a404ab970f951d5A6dbECD9e24838FB6",
    name: "Beefy Retro Gamma CASH-USDC LP Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/retro-gamma-usdc-cash",
    underlying: underlying(assets, assetSymbols["aUSDC_CASH_N"]),
    otherParams: ["0x69359cb103F75F8BCdF3264E649D51e91C5EE62a", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_aUSDC-WETH-N_0xC7cA03A0bE1dBAc350E5BfE5050fC5af6406490E.json
  "0xEeAdd5c29b1bf67EbdEc4dBcE96e3e3e42587917": {
    market: "0xC7cA03A0bE1dBAc350E5BfE5050fC5af6406490E",
    name: "Beefy Retro Gamma USDC-WETH LP Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/retro-gamma-usdc-weth-narrow",
    underlying: underlying(assets, assetSymbols["aUSDC_WETH_N"]),
    otherParams: ["0x5268F5F2a9799f747A55f193d2E266c77653E518", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_aWBTC-WETH-N_0xCB1a06eff3459078c26516ae3a1dB44A61D2DbCA.json
  "0xB172bA5788afCFce23E7e78FC831b407E43E2c5C": {
    market: "0xCB1a06eff3459078c26516ae3a1dB44A61D2DbCA",
    name: "Beefy Retro Gamma WBTC-WETH LP Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/retro-gamma-wbtc-weth",
    underlying: underlying(assets, assetSymbols["aWBTC_WETH_N"]),
    otherParams: ["0xf552a67A82908E6C7F4382b812218d665e058C0B", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  },
  // BeefyERC4626_aWMATIC-MATICX-N_0xdaDbdB5451C2d86B25F0d8fc023600dd8E7d9A70.json
  "0x2609B76320C18A0c7b9c50C323Fd172472Eeb108": {
    market: "0xdaDbdB5451C2d86B25F0d8fc023600dd8E7d9A70",
    name: "Beefy Retro Gamma MATICX-WMATIC LP Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/retro-gamma-wmatic-maticx",
    underlying: underlying(assets, assetSymbols["aWBTC_WETH_N"]),
    otherParams: ["0xec74671f95F0942358016da627b912143100DAF2", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  }
};

export default deployedPlugins;
