import { DelegateContractName, SupportedChains } from "../enums";
import { ChainPlugins } from "../types";

import { assetSymbols, bscAssets } from "./assets";

const chainPluginConfig: ChainPlugins = {
  [SupportedChains.ganache]: {
    // TRIBE
    "0xeD4764ad14Bb60DC698372B92e51CEC62688DC52": [
      {
        cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate,
        strategyName: "Mock Tribe Strategy With TOUCH Rewards",
        strategyCode: "Mock_TRIBE",
        strategyAddress: "0x0152B5D6531fb9D58274caA61C5a3070bE0DA12F",
        flywheels: [
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
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Mock Touch Strategy",
        strategyCode: "Mock_TOUCH",
        strategyAddress: "0x0565f350D74c532fBDb73C41D82Cd3Cbfa118422",
      },
    ],
  },
  [SupportedChains.chapel]: {},
  [SupportedChains.bsc]: {
    // BOMB-BTC LP
    [bscAssets.find((a) => a.symbol === assetSymbols["BTCB-BOMB"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "BOMB-BTC LP Autocompounding (beefy)",
        strategyCode: "BeefyERC4626_BOMBBTCLP",
        strategyAddress: "0x0b96dccbAA03447Fd5f5Fd733e0ebD10680E84c1",
      },
    ],
    // BOMB
    [bscAssets.find((a) => a.symbol === assetSymbols.BOMB)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "BOMB Autocompounding (beefy)",
        strategyCode: "BombERC4626_BOMBxBOMB",
        strategyAddress: "0x10C90bfCFb3D2A7ae814dA1548ae3a7fC31C35A0",
      },
    ],
    // AUTO
    [bscAssets.find((a) => a.symbol === assetSymbols["AUTO"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "TBD",
        strategyCode: "AutofarmERC4626_AUTO",
        strategyAddress: "0xF6B2721BA8DC84F554beD3a62bdFDCfe3FB77358",
      },
    ],
    // 3EPS
    [bscAssets.find((a) => a.symbol === assetSymbols["3EPS"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate,
        strategyName: "3EPS LP Staker with EPX Rewards",
        strategyCode: "DotDotLpERC4626_3EPS",
        strategyAddress: "0x606f111755bb94C5DfF507A76aF4801F959895A0",
        flywheels: [
          {
            // FuseFlywheelDynamicRewards_EPX.json
            address: "0x594a1fdE7D263D2FCE80411f9F0d880a2fb56B2E",
            // EPX rewards
            rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
          },
          {
            // FuseFlywheelDynamicRewards_DDD.json
            address: "0x202EA66c4253bD7DBd59D6836610EC4D6E528DB4",
            // DDD rewards
            rewardToken: "0x84c97300a190676a19D1E13115629A11f8482Bd1",
          },
        ],
      },
    ],
    // dai3EPS
    [bscAssets.find((a) => a.symbol === assetSymbols["dai3EPS"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate,
        strategyName: "dai3EPS LP Staker with EPX Rewards",
        strategyCode: "DotDotLpERC4626_dai3EPS",
        strategyAddress: "0x574f934075D9b9392A8B0d1e0a4ADAD79B4cd16b",
        flywheels: [
          {
            // FuseFlywheelDynamicRewards_EPX.json
            address: "0x594a1fdE7D263D2FCE80411f9F0d880a2fb56B2E",
            // EPX rewards
            rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
          },
          {
            // FuseFlywheelDynamicRewards_DDD.json
            address: "0x202EA66c4253bD7DBd59D6836610EC4D6E528DB4",
            // DDD rewards
            rewardToken: "0x84c97300a190676a19D1E13115629A11f8482Bd1",
          },
        ],
      },
    ],
    // 2brl
    [bscAssets.find((a) => a.symbol === assetSymbols["2brl"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate,
        strategyName: "2brl LP Staker with EPX Rewards",
        strategyCode: "DotDotLpERC4626_2brl",
        strategyAddress: "0x939EF184853C751abD4463363a36c316EC0dBaD4",
        flywheels: [
          {
            // FuseFlywheelDynamicRewards_EPX.json
            address: "0x594a1fdE7D263D2FCE80411f9F0d880a2fb56B2E",
            // EPX rewards
            rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
          },
          {
            // FuseFlywheelDynamicRewards_DDD.json
            address: "0x202EA66c4253bD7DBd59D6836610EC4D6E528DB4",
            // DDD rewards
            rewardToken: "0x84c97300a190676a19D1E13115629A11f8482Bd1",
          },
        ],
      },
    ],
    // WBNB
    [bscAssets.find((a) => a.symbol === assetSymbols.WBNB)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibWBNB Vault",
        strategyCode: "AlpacaERC4626_WBNB",
        strategyAddress: "0xc24C0FC5314F4D866C7c37bacC87085C72A3CEca",
      },
    ],
    // ETH
    [bscAssets.find((a) => a.symbol === assetSymbols.ETH)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibETH Vault",
        strategyCode: "AlpacaERC4626_ETH",
        strategyAddress: "0x54d4116eDb9c77b8C501a17342fcfE80990e2064",
      },
    ],
    // BUSD
    [bscAssets.find((a) => a.symbol === assetSymbols.BUSD)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibBUSD Vault",
        strategyCode: "AlpacaERC4626_BUSD",
        strategyAddress: "0xBd4b66CF58207F88e0Ab56D40B591514Bb190923",
      },
    ],
    // USDT
    [bscAssets.find((a) => a.symbol === assetSymbols.USDT)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibUSDT Vault",
        strategyCode: "AlpacaERC4626_USDT",
        strategyAddress: "0x7d0e43e64656e149841a44E8145b329C9BbcBf4e",
      },
    ],
    // USDC
    [bscAssets.find((a) => a.symbol === assetSymbols.USDC)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibUSDC Vault",
        strategyCode: "AlpacaERC4626_USDC",
        strategyAddress: "0x91f893820B1Ab8d0003c552980741b541C2A02e2",
      },
    ],
    // TUSD
    [bscAssets.find((a) => a.symbol === assetSymbols.TUSD)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibTUSD Vault",
        strategyCode: "AlpacaERC4626_TUSD",
        strategyAddress: "0x40785A3BADd0491844ABaA98eB979245c156eF33",
      },
    ],
    // BTCB
    [bscAssets.find((a) => a.symbol === assetSymbols.BTCB)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibBTCB Vault",
        strategyCode: "AlpacaERC4626_BTCB",
        strategyAddress: "0x5382C4E344dA039323288ec3dc0294ba92625534",
      },
    ],
    // BETH
    [bscAssets.find((a) => a.symbol === assetSymbols.BETH)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibBETH Vault",
        strategyCode: "AlpacaERC4626_BETH",
        strategyAddress: "0xCBE401B8874A1C30163740f5f45156088Eb21481",
      },
    ],
  },

  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {},
  [SupportedChains.moonbeam]: {},
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.aurora]: {},
  [SupportedChains.neon_devnet]: {},
};

export default chainPluginConfig;
