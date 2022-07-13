import { DelegateContractName, SupportedChains } from "../enums";
import { ChainPlugins } from "../types";

import { assetSymbols, bscAssets, chapelAssets, moonbeamAssets } from "./assets";

const chainPluginConfig: ChainPlugins = {
  [SupportedChains.ganache]: {
    // TRIBE
    "0xf9a089C918ad9c484201E7d328C0d29019997117": [
      {
        cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate,
        strategyName: "Mock Tribe Strategy With TOUCH Rewards",
        strategyCode: "Mock_TRIBE",
        strategyAddress: "0xD91096346CB39c5dCCEd4F32D6D0F8DEAE2020EF",
        flywheels: [
          {
            address: "0x56385f347e18452C00801c9E5029E7658B017EB5",
            rewardToken: "0x02Ec29Fd9f0bB212eD2C4926ACe1aeab732ed620", // TOUCH
          },
        ],
      },
    ],
    // TOUCH
    "0x02Ec29Fd9f0bB212eD2C4926ACe1aeab732ed620": [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Mock Touch Strategy",
        strategyCode: "Mock_TOUCH",
        strategyAddress: "0x64f11C365B68Dd689a54997360B0a580ECdaB0F2",
      },
    ],
  },
  [SupportedChains.chapel]: {
    [chapelAssets.find((a) => a.symbol === assetSymbols.BUSD)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Mock_BUSD",
        strategyCode: "MockERC4626_BUSD",
        strategyAddress: "0x865058A4aF2f70671C10333f21e2B3A8Ce9fB032",
      },
    ],
  },
  [SupportedChains.bsc]: {
    // BOMB-BTC LP
    [bscAssets.find((a) => a.symbol === assetSymbols["BTCB-BOMB"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "BOMB-BTC LP Autocompounding (beefy)",
        strategyCode: "BeefyERC4626_BOMBBTCLP",
        strategyAddress: "0xB41B331047bb0693aE00eb75973DFBE21e6f4985",
      },
    ],
    // BTCB-ETH LP
    [bscAssets.find((a) => a.symbol === assetSymbols["BTCB-ETH"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "BTCB-ETH LP Autocompounding (beefy)",
        strategyCode: "BeefyERC4626_BTCBETHLP",
        strategyAddress: "0xa89BF1B0fae877e8185E46af22B80f2D5333A90D",
      },
    ],
    // CAKE-BNB LP
    [bscAssets.find((a) => a.symbol === assetSymbols["CAKE-WBNB"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "CAKE-BNB LP Autocompounding (beefy)",
        strategyCode: "BeefyERC4626_CAKEBNBLP",
        strategyAddress: "0xdaEB649257bce27Ab3B2d9b7Ca483d1Cf70d1b52",
      },
    ],
    // ETH-WBNB LP
    [bscAssets.find((a) => a.symbol === assetSymbols["WBNB-ETH"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "ETH-WBNB LP Autocompounding (beefy)",
        strategyCode: "BeefyERC4626_ETHWBNBLP",
        strategyAddress: "0x7f858A2f4786D594e243Ce38C7994460f1fB68d0",
      },
    ],
    // USDC-BUSD LP
    [bscAssets.find((a) => a.symbol === assetSymbols["USDC-BUSD"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "USDC-BUSD LP Autocompounding (beefy)",
        strategyCode: "BeefyERC4626_USDCBUSDLP",
        strategyAddress: "0x0097f47202aA23a984Ddd128F9c5A32A6B826F9A",
      },
    ],
    // BUSD-BNB LP
    [bscAssets.find((a) => a.symbol === assetSymbols["WBNB-BUSD"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "BUSD-BNB LP Autocompounding (beefy)",
        strategyCode: "BeefyERC4626_WBNBBUSDLP",
        strategyAddress: "0x3eAA0506A6Fff1509e6db1Fcf6912D3a3B61Cf9B",
      },
    ],
    // BOMB
    [bscAssets.find((a) => a.symbol === assetSymbols.BOMB)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "BOMB Autocompounding (beefy)",
        strategyCode: "BombERC4626_BOMBxBOMB",
        strategyAddress: "0xadD4f8110d161f419dD50F9B067E89eCe5500838",
      },
    ],
    // AUTO
    [bscAssets.find((a) => a.symbol === assetSymbols["AUTO"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "TBD",
        strategyCode: "AutofarmERC4626_AUTO",
        strategyAddress: "0x0eb2B2DdB440E979F0b4123b3E7B4B5419a2086F",
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
            // FuseFlywheelCore_EPX.json
            address: "0xf06bb51fB6bfA6B46D8641d5bCeA60bd9454Cf83",
            // EPX rewards
            rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
          },
          {
            // FuseFlywheelCore_DDD.json
            address: "0x0429cBBdc856366857a60c5F3424A4b477621761",
            // DDD rewards
            rewardToken: "0x84c97300a190676a19D1E13115629A11f8482Bd1",
          },
        ],
      },
    ],
    // TODO: UPDATE AFTER DEPLOY
    [bscAssets.find((a) => a.symbol === assetSymbols.val3EPS)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate,
        strategyName: "val3EPS LP Staker with EPX Rewards",
        strategyCode: "DotDotLpERC4626_val3EPS",
        strategyAddress: "0x1006aD7233cD2a7ee03DdDCdc8220cA5F3F03CD9",
        flywheels: [
          {
            // FuseFlywheelCore_EPX.json
            address: "0xf06bb51fB6bfA6B46D8641d5bCeA60bd9454Cf83",
            // EPX rewards
            rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
          },
          {
            // FuseFlywheelCore_DDD.json
            address: "0x0429cBBdc856366857a60c5F3424A4b477621761",
            // DDD rewards
            rewardToken: "0x84c97300a190676a19D1E13115629A11f8482Bd1",
          },
        ],
      },
    ],
    // TODO: UPDATE AFTER DEPLOY
    [bscAssets.find((a) => a.symbol === assetSymbols.valdai3EPS)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate,
        strategyName: "valdai3EPS LP Staker with EPX Rewards",
        strategyCode: "DotDotLpERC4626_valdai3EPS",
        strategyAddress: "0xacBE0EE18069f1639cBc9F95eBba5eb8a8bcF34c",
        flywheels: [
          {
            // FuseFlywheelCore_EPX.json
            address: "0xf06bb51fB6bfA6B46D8641d5bCeA60bd9454Cf83",
            // EPX rewards
            rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
          },
          {
            // FuseFlywheelCore_DDD.json
            address: "0x0429cBBdc856366857a60c5F3424A4b477621761",
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
            // FuseFlywheelCore_EPX.json
            address: "0xf06bb51fB6bfA6B46D8641d5bCeA60bd9454Cf83",
            // EPX rewards
            rewardToken: "0xaf41054c1487b0e5e2b9250c0332ecbce6ce9d71",
          },
          {
            // FuseFlywheelCore_DDD.json
            address: "0x0429cBBdc856366857a60c5F3424A4b477621761",
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
        strategyAddress: "0x1B9Ce82Cf99D8181dA39c0572A81E042A21EE815",
      },
    ],
    // ETH
    [bscAssets.find((a) => a.symbol === assetSymbols.ETH)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibETH Vault",
        strategyCode: "AlpacaERC4626_ETH",
        strategyAddress: "0x7c7967EFf04E89B3033F5BB01D82e35929c6eC33",
      },
    ],
    // BUSD
    [bscAssets.find((a) => a.symbol === assetSymbols.BUSD)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibBUSD Vault",
        strategyCode: "AlpacaERC4626_BUSD",
        strategyAddress: "0x9223EcAD6F7E73f73Ee7f9e74D48d9f9050A1954",
      },
    ],
    // USDT
    [bscAssets.find((a) => a.symbol === assetSymbols.USDT)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibUSDT Vault",
        strategyCode: "AlpacaERC4626_USDT",
        strategyAddress: "0xC167A896a28599e9AB211E5573c6A5b1953E32a0",
      },
    ],
    // USDC
    [bscAssets.find((a) => a.symbol === assetSymbols.USDC)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibUSDC Vault",
        strategyCode: "AlpacaERC4626_USDC",
        strategyAddress: "0xb38E3FFC29B148B4f0b127ED721a4b58e91cD824",
      },
    ],
    // TUSD
    [bscAssets.find((a) => a.symbol === assetSymbols.TUSD)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibTUSD Vault",
        strategyCode: "AlpacaERC4626_TUSD",
        strategyAddress: "0x8fC8565BAB740597C0fE985cb739eB48bdb1fD74",
      },
    ],
    // BTCB
    [bscAssets.find((a) => a.symbol === assetSymbols.BTCB)!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginDelegate,
        strategyName: "Alpaca Finance ibBTCB Vault",
        strategyCode: "AlpacaERC4626_BTCB",
        strategyAddress: "0xe9c47E742a2fD2b2a1cef2231BE7BDE16C82A0FB",
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
  [SupportedChains.moonbeam]: {
    [moonbeamAssets.find((a) => a.symbol === assetSymbols["GLMR-GLINT"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate,
        strategyName: "GLMR-GLINT LP Staker with GLINT Rewards",
        strategyCode: "BeamERC4626_GLMR-GLNT",
        strategyAddress: "0x1b34c8A1a414a3642877Dc78C5E1eEfE5FF831bA",
        flywheels: [
          {
            // FuseFlywheelCore_GLINT.json
            address: "0xF57b2bD963F61C556F89e6dCb590A758eAd2F37B",
            // GLINT rewards
            rewardToken: moonbeamAssets.find((a) => a.symbol === assetSymbols.GLINT)!.underlying,
          },
        ],
      },
    ],
    [moonbeamAssets.find((a) => a.symbol === assetSymbols["GLMR-USDC"])!.underlying]: [
      {
        cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate,
        strategyName: "GLMR-USDC LP Staker with GLINT Rewards",
        strategyCode: "BeamERC4626_GLMR-USDC",
        strategyAddress: "0xd17B82A8017a3C5c5c3Fa3eBc4AE12a164997CC1",
        flywheels: [
          {
            // FuseFlywheelCore_GLINT.json
            address: "0xF57b2bD963F61C556F89e6dCb590A758eAd2F37B",
            // GLINT rewards
            rewardToken: moonbeamAssets.find((a) => a.symbol === assetSymbols.GLINT)!.underlying,
          },
        ],
      },
    ],
  },
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.aurora]: {},
  [SupportedChains.neon_devnet]: {},
  [SupportedChains.polygon]: {},
  [SupportedChains.mumbai]: {},
};

export default chainPluginConfig;
