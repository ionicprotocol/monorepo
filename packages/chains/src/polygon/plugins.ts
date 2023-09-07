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
    otherParams: ["0xf552a67A82908E6C7F4382b812218d665e058C0B", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  }
};

export default deployedPlugins;
