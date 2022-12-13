import { assetSymbols, DeployedPlugins, Strategy, underlying } from "@midas-capital/types";

import assets from "./assets";

const deployedPlugins: DeployedPlugins = {
  // MiniChefERC4626_WEVMOS-gUSDC_0x8875C45b4813c60C3dC51Aea25d66Dbf2711af9e.json
  "0x55E9491C0dbfc01D86D68C2F50C3B3054FbF1b1E": {
    market: "0x8875C45b4813c60C3dC51Aea25d66Dbf2711af9e",
    name: "Diffusion MiniChefV2 WEVMOS-gUSDC",
    strategy: Strategy.MiniChefV2,
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/ellipsis-x-dotdot",
    underlying: underlying(assets, assetSymbols["WEVMOS-gUSDC"]),
    otherParams: ["6", "0x067eC87844fBD73eDa4a1059F30039584586e09d"], // poolId, minchef address
    flywheels: ["0x6537110273d79184205395cfd852dcF3DA6861Ed", "0xEdcefE496FFf12897F6794E22BacCc7DE1D4422F"], // DIFF, GRAV flywheels
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/diffusion.png",
  },
  // MiniChefERC4626_WEVMOS-gWETH_0xa1d5A953c43584D0AFD85Ce287Fa8a09f726180F.json
  "0xac3a94DA16B99622744D39EABFa8a50787d91cc4": {
    market: "0xa1d5A953c43584D0AFD85Ce287Fa8a09f726180F",
    name: "Diffusion MiniChefV2 WEVMOS-gWETH",
    strategy: Strategy.MiniChefV2,
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/ellipsis-x-dotdot",
    underlying: underlying(assets, assetSymbols["WEVMOS-gWETH"]),
    otherParams: ["7", "0x067eC87844fBD73eDa4a1059F30039584586e09d"], // poolId, minchef address
    flywheels: ["0x6537110273d79184205395cfd852dcF3DA6861Ed", "0xEdcefE496FFf12897F6794E22BacCc7DE1D4422F"], // DIFF, GRAV flywheels
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/diffusion.png",
  },
  // MiniChefERC4626_WEVMOS-ceUSDC_0xa7492b8aa271c43498ACAa75385631b8b326aed3.json
  "0x857248d02b11c7Cbf8a9Ddc026a0A59d396F1D8c": {
    market: "0xa7492b8aa271c43498ACAa75385631b8b326aed3",
    name: "Diffusion MiniChefV2 WEVMOS-ceUSDC",
    strategy: Strategy.MiniChefV2,
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/ellipsis-x-dotdot",
    underlying: underlying(assets, assetSymbols["WEVMOS-ceUSDC"]),
    otherParams: ["8", "0x067eC87844fBD73eDa4a1059F30039584586e09d"], // poolId, minchef address
    flywheels: ["0x6537110273d79184205395cfd852dcF3DA6861Ed", "0x1a8Fef140D955f8BCea6BCe4cFfD2cEA0fd02af6"], // DIFF, EVMOS flywheels
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/diffusion.png",
  },
  // MiniChefERC4626_ceUSDC-ceUSDT_0x580216B72d2f70953d3Be4E885863aC295670EE5.json
  "0x74f5280443c0Ab2A42eaa1ED0aEa6F4c45599b68": {
    market: "0x580216B72d2f70953d3Be4E885863aC295670EE5",
    name: "Diffusion MiniChefV2 ceUSDC-ceUSDT",
    strategy: Strategy.MiniChefV2,
    strategyDocsUrl:
      "https://docs.midascapital.xyz/guides/assets-and-strategies-addresses/binance-smart-chain-bsc/ellipsis-x-dotdot",
    underlying: underlying(assets, assetSymbols["ceUSDC-ceUSDT"]),
    otherParams: ["9", "0x067eC87844fBD73eDa4a1059F30039584586e09d"], // poolId, minchef address
    flywheels: ["0x6537110273d79184205395cfd852dcF3DA6861Ed"], // DIFF flywheel
    icon: "https://d1912tcoux65lj.cloudfront.net/plugin/diffusion.png",
  },
};

export default deployedPlugins;
