import { SupportedChains } from "../enums";
import { ChainPlugins } from "../types";

import { assetSymbols, bscAssets } from "./assets";

const chainPluginConfig: ChainPlugins = {
  [SupportedChains.ganache]: {
    // TRIBE
    "0xeD4764ad14Bb60DC698372B92e51CEC62688DC52": [
      {
        strategyName: "Mock Tribe Strategy With TOUCH Rewards",
        strategyAddress: "0x0152B5D6531fb9D58274caA61C5a3070bE0DA12F",
        dynamicFlywheels: [
          {
            address: "0xcB8A516b152a2c510d0860b551f157A9a3fc0f24",
            rewardToken: "0xD54Ae101D6980dB5a8Aa60124b2e5D4B7f02f12C", // TOUCH
          },
        ],
      },
    ],
    // TOUCH
    "0xD54Ae101D6980dB5a8Aa60124b2e5D4B7f02f12C": [
      {
        strategyName: "Mock Touch Strategy",
        strategyAddress: "0x0565f350D74c532fBDb73C41D82Cd3Cbfa118422",
      },
    ],
  },
  [SupportedChains.chapel]: {},
  [SupportedChains.bsc]: {
    // BOMB-BTC LP
    [bscAssets.find((a) => a.symbol === assetSymbols["BTCB-BOMB"])!.underlying]: [
      {
        strategyName: "BOMB-BTC LP Autocompounding (beefy)",
        strategyAddress: "0x9015315d6757fd1c8735F7d3f0E7fE3E76934c40",
      },
    ],
    // BOMB
    [bscAssets.find((a) => a.symbol === assetSymbols.BOMB)!.underlying]: [
      {
        strategyName: "BOMB Autocompounding (beefy)",
        strategyAddress: "0x9baB520eBB7954D0030E9cF03A9345554994a786",
      },
    ],
    // 3EPS
    [bscAssets.find((a) => a.symbol === assetSymbols["3EPS"])!.underlying]: [
      {
        strategyName: "3EPS LP Staker with EPX Rewards",
        strategyAddress: "",
        dynamicFlywheels: [
          {
            address: "0x968086e25851D465127Bb536516c2162Cd79B360",
            rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
          },
        ],
      },
    ],
    // dai3EPS
    [bscAssets.find((a) => a.symbol === assetSymbols["dai3EPS"])!.underlying]: [
      {
        strategyName: "dai3EPS LP Staker with EPX Rewards",
        strategyAddress: "",
        dynamicFlywheels: [
          {
            address: "0x968086e25851D465127Bb536516c2162Cd79B360",
            rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
          },
        ],
      },
    ],
    // ust3EPS
    // "0x151F1611b2E304DEd36661f65506f9D7D172beba": [
    //   {
    //     strategyName: "ust3EPS LP Staker with EPX Rewards",
    //     strategyAddress: "",
    //     dynamicFlywheel: {
    //       address: "0x968086e25851D465127Bb536516c2162Cd79B360",
    //       rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
    //     },
    //   },
    // ],
    // WBNB
    [bscAssets.find((a) => a.symbol === assetSymbols.WBNB)!.underlying]: [
      {
        strategyName: "Alpaca Finance ibWBNB Vault",
        strategyAddress: "0x0b434c33905C2B80bA978B90bFD874dFBa5260b3",
      },
    ],
    // ETH
    [bscAssets.find((a) => a.symbol === assetSymbols.ETH)!.underlying]: [
      {
        strategyName: "Alpaca Finance ibETH Vault",
        strategyAddress: "0xCBE401B8874A1C30163740f5f45156088Eb21481",
      },
    ],
    // BUSD
    [bscAssets.find((a) => a.symbol === assetSymbols.BUSD)!.underlying]: [
      {
        strategyName: "Alpaca Finance ibBUSD Vault",
        strategyAddress: "0x9012ef7414D5c42873D94506b91C1677BF4DfF38",
      },
    ],
    // USDT
    [bscAssets.find((a) => a.symbol === assetSymbols.USDT)!.underlying]: [
      {
        strategyName: "Alpaca Finance ibUSDT Vault",
        strategyAddress: "0xF0BbDdd4EF2Ac465f949B45f0c7a8AFFCD09C8AC",
      },
    ],
    // USDC
    [bscAssets.find((a) => a.symbol === assetSymbols.USDC)!.underlying]: [
      {
        strategyName: "Alpaca Finance ibUSDC Vault",
        strategyAddress: "0x40bDBA20fc031042d0b4cF804caDe6109DBEb33C",
      },
    ],
    // TUSD
    [bscAssets.find((a) => a.symbol === assetSymbols.TUSD)!.underlying]: [
      {
        strategyName: "Alpaca Finance ibTUSD Vault",
        strategyAddress: "",
      },
    ],
    // BTCB
    [bscAssets.find((a) => a.symbol === assetSymbols.BTCB)!.underlying]: [
      {
        strategyName: "Alpaca Finance ibBTCB Vault",
        strategyAddress: "0xE2f3563b4E7d19bcC3B1F63e61D4D29f6dD7e593",
      },
    ],
  },

  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {},
  [SupportedChains.moonbeam]: {},
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.aurora]: {},
};

export default chainPluginConfig;
