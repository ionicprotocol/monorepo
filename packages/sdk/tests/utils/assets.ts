import { cERC20Conf, DelegateContractName } from "../../src";
import { getOrCreateFuse } from "./fuseSdk";
import { bscAssets, ganacheAssets } from "../../src/chainConfig/assets";
import { assetSymbols } from "../../src/chainConfig";
import { ethers } from "hardhat";

export enum BSC_POOLS {
  JARVIS = "JARVIS",
  ALPACA = "ALPACA",
  BOMB = "BOMB",
  ELLIPSIS = "ELLIPSIS",
}

const getBscPools = async (comptroller, fuseFeeDistributor, interestRateModelAddress) => {
  return {
    [BSC_POOLS.JARVIS]: await getJarvisPoolAssets(comptroller, fuseFeeDistributor, interestRateModelAddress),
    [BSC_POOLS.ALPACA]: await getAlpacaPoolAssets(comptroller, fuseFeeDistributor, interestRateModelAddress),
    [BSC_POOLS.BOMB]: await getBombPoolAssets(comptroller, fuseFeeDistributor, interestRateModelAddress),
    [BSC_POOLS.ELLIPSIS]: await getEllipsisPoolAssets(comptroller, fuseFeeDistributor, interestRateModelAddress)
  };
};

export const getAssetsConf = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress,
  ethers,
  poolName?: BSC_POOLS | string
): Promise<cERC20Conf[]> => {
  const { chainId } = await ethers.provider.getNetwork();

  let assets: cERC20Conf[];

  if (chainId === 31337 || chainId === 1337) {
    assets = await getLocalAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress);
  } else if (chainId === 56) {
    if (poolName in BSC_POOLS) {
      const bscPools = await getBscPools(comptroller, fuseFeeDistributor, interestRateModelAddress);
      assets = bscPools[poolName];
    } else {
      assets = getBaseBscAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress);
    }
  }
  return assets;
};

export const getLocalAssetsConf = async (comptroller, fuseFeeDistributor, interestRateModelAddress) => {
  const eth = ganacheAssets.find((b) => b.symbol === assetSymbols.ETH);
  const tribe = ganacheAssets.find((b) => b.symbol === assetSymbols.TRIBE);
  const touch = ganacheAssets.find((b) => b.symbol === assetSymbols.TOUCH);
  // const weth = ganacheAssets.find((b) => b.symbol === assetSymbols.WETH);

  const assets = [eth, tribe, touch]; // , weth];
  const tribeUnderlying = await ethers.getContract("TRIBEToken");
  const touchUnderlying = await ethers.getContract("TOUCHToken");
  const underlyings = [eth.underlying, tribeUnderlying.address, touchUnderlying.address]; // , weth.underlying]
  return assets.map((a, i) => {
    return {
      underlying: underlyings[i],
      comptroller,
      fuseFeeDistributor,
      interestRateModel: interestRateModelAddress,
      name: a.name,
      symbol: a.symbol,
      admin: "true",
      collateralFactor: 75,
      reserveFactor: 15,
      adminFee: 0,
      bypassPriceFeedCheck: true
    };
  });
};

export const getBaseBscAssetsConf = (comptroller, fuseFeeDistributor, interestRateModelAddress) => {
  const btc = bscAssets.find((b) => b.symbol === assetSymbols.BTCB);
  const busd = bscAssets.find((b) => b.symbol === assetSymbols.BUSD);
  const wbnb = bscAssets.find((b) => b.symbol === assetSymbols.WBNB);
  const eth = bscAssets.find((b) => b.symbol === assetSymbols.ETH);
  const assets = [btc, busd, eth, wbnb];

  return assets.map((a, i) => {
    return {
      underlying: a.underlying,
      comptroller,
      fuseFeeDistributor,
      interestRateModel: interestRateModelAddress,
      name: a.name,
      symbol: a.symbol,
      admin: "true",
      collateralFactor: 75,
      reserveFactor: 15,
      adminFee: 0,
      bypassPriceFeedCheck: true
    };
  });
};

export const getAlpacaPoolAssets = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress
): Promise<cERC20Conf[]> => {
  const sdk = await getOrCreateFuse();

  const eth = bscAssets.find((b) => b.symbol === assetSymbols.ETH);
  const usdc = bscAssets.find((b) => b.symbol === assetSymbols.USDC);
  const busd = bscAssets.find((b) => b.symbol === assetSymbols.BUSD);
  const wbnb = bscAssets.find((b) => b.symbol === assetSymbols.WBNB);
  const ethPlugin = sdk.chainPlugins[eth.underlying][0];
  const usdcPlugin = sdk.chainPlugins[usdc.underlying][0];
  const busdPlugin = sdk.chainPlugins[busd.underlying][0];
  const wbnbPlugin = sdk.chainPlugins[wbnb.underlying][0];

  const assets = [eth, usdc, busd, wbnb];

  const assetConfigs = [
    { delegateContractName: DelegateContractName.CErc20PluginDelegate, plugin: ethPlugin.strategyAddress },
    { delegateContractName: DelegateContractName.CErc20PluginDelegate, plugin: usdcPlugin.strategyAddress },
    { delegateContractName: DelegateContractName.CErc20PluginDelegate, plugin: busdPlugin.strategyAddress },
    { delegateContractName: DelegateContractName.CErc20PluginDelegate, plugin: wbnbPlugin.strategyAddress }
  ];
  return assets.map((a, i) => {
    return {
      ...assetConfigs[i],
      underlying: a.underlying,
      comptroller,
      fuseFeeDistributor,
      interestRateModel: interestRateModelAddress,
      name: a.name,
      symbol: a.symbol,
      admin: "true",
      collateralFactor: 75,
      reserveFactor: 15,
      adminFee: 0,
      bypassPriceFeedCheck: true
    };
  });
};

export const getJarvisPoolAssets = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress
): Promise<cERC20Conf[]> => {
  const jBRL = bscAssets.find((b) => b.symbol === assetSymbols.jBRL);
  const assets = [jBRL];
  const assetConfigs = [{ delegateContractName: DelegateContractName.CErc20Delegate }];
  return assets.map((a, i) => {
    return {
      ...assetConfigs[i],
      underlying: a.underlying,
      comptroller,
      fuseFeeDistributor,
      interestRateModel: interestRateModelAddress,
      name: a.name,
      symbol: a.symbol,
      admin: "true",
      collateralFactor: 75,
      reserveFactor: 15,
      adminFee: 0,
      bypassPriceFeedCheck: true
    };
  });
};

export const getBombPoolAssets = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress
): Promise<cERC20Conf[]> => {
  const sdk = await getOrCreateFuse();

  const btcb = bscAssets.find((b) => b.symbol === assetSymbols.BTCB);
  const bomb = bscAssets.find((b) => b.symbol === assetSymbols.BOMB);
  const bombbtcb = bscAssets.find((b) => b.symbol === assetSymbols["BTCB-BOMB"]);
  const bombPlugin = sdk.chainPlugins[bomb.underlying][0];
  const bombbtcbPlugin = sdk.chainPlugins[bombbtcb.underlying][0];

  const assets = [btcb, bomb, bombbtcb];

  const assetConfigs = [
    { delegateContractName: DelegateContractName.CErc20Delegate },
    { delegateContractName: DelegateContractName.CErc20PluginDelegate, plugin: bombPlugin.strategyAddress },
    { delegateContractName: DelegateContractName.CErc20PluginDelegate, plugin: bombbtcbPlugin.strategyAddress }
  ];
  return assets.map((a, i) => {
    return {
      ...assetConfigs[i],
      underlying: a.underlying,
      comptroller,
      fuseFeeDistributor,
      interestRateModel: interestRateModelAddress,
      name: a.name,
      symbol: a.symbol,
      admin: "true",
      collateralFactor: 75,
      reserveFactor: 15,
      adminFee: 0,
      bypassPriceFeedCheck: true
    };
  });
};

export const getEllipsisPoolAssets = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress
): Promise<cERC20Conf[]> => {
  const sdk = await getOrCreateFuse();

  const dai3EPS = bscAssets.find((b) => b.symbol === assetSymbols.dai3EPS);
  const threeEPS = bscAssets.find((b) => b.symbol === assetSymbols["3EPS"]);
  const dai3EPSPlugin = sdk.chainPlugins[dai3EPS.underlying][0];
  const threeEPSPlugin = sdk.chainPlugins[threeEPS.underlying][0];

  const assets = [dai3EPS, threeEPS];

  const assetConfigs = [
    {
      delegateContractName: DelegateContractName.CErc20PluginDelegate,
      plugin: dai3EPSPlugin.strategyAddress,
      rewardsDistributorConfig: dai3EPSPlugin.dynamicFlywheels.map((rd => {
        return {
          rewardsDistributor: rd.address,
          rewardToken: rd.rewardToken
        };
      }))
    },
    {
      delegateContractName: DelegateContractName.CErc20PluginDelegate,
      plugin: threeEPSPlugin.strategyAddress,
      rewardsDistributorConfig: threeEPSPlugin.dynamicFlywheels.map((rd => {
        return {
          rewardsDistributor: rd.address,
          rewardToken: rd.rewardToken
        };
      }))

    }
  ];
  return assets.map((a, i) => {
    return {
      ...assetConfigs[i],
      underlying: a.underlying,
      comptroller,
      fuseFeeDistributor,
      interestRateModel: interestRateModelAddress,
      name: a.name,
      symbol: a.symbol,
      admin: "true",
      collateralFactor: 75,
      reserveFactor: 15,
      adminFee: 0,
      bypassPriceFeedCheck: true
    };
  });
};
