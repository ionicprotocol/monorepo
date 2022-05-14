import { ChainPlugins } from "../Fuse/types";
import { SupportedChains } from "./index";

const chainPluginConfig: ChainPlugins = {
  [SupportedChains.ganache]: {
    // TRIBE
    "0xeD4764ad14Bb60DC698372B92e51CEC62688DC52": [
      {
        strategyName: "Mock Tribe Strategy With TOUCH Rewards",
        strategyAddress: "0x0152B5D6531fb9D58274caA61C5a3070bE0DA12F",
        dynamicFlywheel: {
          address: "0xcB8A516b152a2c510d0860b551f157A9a3fc0f24",
          rewardToken: "0xD54Ae101D6980dB5a8Aa60124b2e5D4B7f02f12C", // TOUCH
        },
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
    "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6": [
      {
        strategyName: "BOMB-BTC LP Autocompounding (beefy)",
        strategyAddress: "0x9015315d6757fd1c8735F7d3f0E7fE3E76934c40",
      },
    ],
    // BOMB
    "0x522348779DCb2911539e76A1042aA922F9C47Ee3": [
      {
        strategyName: "BOMB Autocompounding (beefy)",
        strategyAddress: "0x9baB520eBB7954D0030E9cF03A9345554994a786",
      },
    ],
    // 3EPS
    "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452": [
      {
        strategyName: "3EPS LP Staker with EPX Rewards",
        strategyAddress: "",
        dynamicFlywheel: {
          address: "0x968086e25851D465127Bb536516c2162Cd79B360",
          rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
        },
      },
    ],
    // dai3EPS
    "0x0BC3a8239B0a63E945Ea1bd6722Ba747b9557e56": [
      {
        strategyName: "dai3EPS LP Staker with EPX Rewards",
        strategyAddress: "",
        dynamicFlywheel: {
          address: "0x968086e25851D465127Bb536516c2162Cd79B360",
          rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
        },
      },
    ],
    // ust3EPS
    "0x151F1611b2E304DEd36661f65506f9D7D172beba": [
      {
        strategyName: "ust3EPS LP Staker with EPX Rewards",
        strategyAddress: "",
        dynamicFlywheel: {
          address: "0x968086e25851D465127Bb536516c2162Cd79B360",
          rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
        },
      },
    ],
    // WBNB
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": [
      {
        strategyName: "Alpaca Finance ibWBNB Vault",
        strategyAddress: "0x0b434c33905C2B80bA978B90bFD874dFBa5260b3",
      },
    ],
    // ETH
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8": [
      {
        strategyName: "Alpaca Finance ibETH Vault",
        strategyAddress: "0xCBE401B8874A1C30163740f5f45156088Eb21481",
      },
    ],
    // BUSD
    "0xe9e7cea3dedca5984780bafc599bd69add087d56": [
      {
        strategyName: "Alpaca Finance ibBUSD Vault",
        strategyAddress: "0x9012ef7414D5c42873D94506b91C1677BF4DfF38",
      },
    ],
    // USDT
    "0x55d398326f99059ff775485246999027b3197955": [
      {
        strategyName: "Alpaca Finance ibUSDT Vault",
        strategyAddress: "0xF0BbDdd4EF2Ac465f949B45f0c7a8AFFCD09C8AC",
      },
    ],
    // USDC
    "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": [
      {
        strategyName: "Alpaca Finance ibUSDC Vault",
        strategyAddress: "0x40bDBA20fc031042d0b4cF804caDe6109DBEb33C",
      },
    ],
    // TUSD
    "0x14016e85a25aeb13065688cafb43044c2ef86784": [
      {
        strategyName: "Alpaca Finance ibTUSD Vault",
        strategyAddress: "",
      },
    ],
    // BTCB
    "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c": [
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
