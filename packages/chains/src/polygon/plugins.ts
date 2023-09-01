import { assetSymbols, DeployedPlugins, Strategy, underlying } from "@ionicprotocol/types";

import assets from "./assets";

const deployedPlugins: DeployedPlugins = {
  // BeefyERC4626_sAMM-DAI-USDR_0xBcE30B4D78cEb9a75A1Aa62156529c3592b3F08b.json
  "0xAe8a8253cd70A8Ad4749aAd850A99e2f30552f10": {
    market: "0xBcE30B4D78cEb9a75A1Aa62156529c3592b3F08b",
    name: "Beefy USDR-DAI sLP vault Vault",
    strategy: Strategy.Beefy,
    apyDocsUrl: "https://app.beefy.finance/vault/pearl-usdrv3-dai",
    underlying: underlying(assets, assetSymbols["sAMM-DAI/USDR"]),
    otherParams: ["0x2C6d11e756986f1537a2c71c851e9a1F7A0008b2", "0"],
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/beefy.png"
  }
};

export default deployedPlugins;
