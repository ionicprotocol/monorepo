import { ethers } from "hardhat";

import { MarketConfig } from "../../src";
import { assetSymbols } from "../../src/chainConfig";
import { bscAssets, chapelAssets, ganacheAssets } from "../../src/chainConfig/assets";

import { getOrCreateMidas } from "./midasSdk";

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
    [BSC_POOLS.ELLIPSIS]: await getEllipsisPoolAssets(comptroller, fuseFeeDistributor, interestRateModelAddress),
  };
};

export const getAssetsConf = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress,
  ethers,
  poolName?: BSC_POOLS | string
): Promise<MarketConfig[]> => {
  const { chainId } = await ethers.provider.getNetwork();

  let assets: MarketConfig[];

  if (chainId === 31337 || chainId === 1337) {
    assets = await getLocalAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress);
  } else if (chainId === 56) {
    if (poolName in BSC_POOLS) {
      const bscPools = await getBscPools(comptroller, fuseFeeDistributor, interestRateModelAddress);
      assets = bscPools[poolName];
    } else {
      assets = getBaseBscAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress);
    }
  } else if (chainId == 97) {
    assets = await getChapelAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress);
  }
  return assets;
};

export const getChapelAssetsConf = async (comptroller, fuseFeeDistributor, interestRateModelAddress) => {
  const btc = chapelAssets.find((b) => b.symbol === assetSymbols.BTCB);
  const busd = chapelAssets.find((b) => b.symbol === assetSymbols.BUSD);
  const wbnb = chapelAssets.find((b) => b.symbol === assetSymbols.WBNB);
  const safemoon = chapelAssets.find((b) => b.symbol === assetSymbols.SAFEMOON);
  const assets = [btc, busd, safemoon, wbnb];

  return assets.map((a) => {
    return {
      underlying: a.underlying,
      comptroller,
      fuseFeeDistributor,
      interestRateModel: interestRateModelAddress,
      name: a.name,
      symbol: a.symbol,
      collateralFactor: 75,
      reserveFactor: 15,
      adminFee: 0,
      bypassPriceFeedCheck: true,
    };
  });
};

export const getLocalAssetsConf = async (comptroller, fuseFeeDistributor, interestRateModelAddress) => {
  const weth = ganacheAssets.find((b) => b.symbol === assetSymbols.WETH);
  const tribe = ganacheAssets.find((b) => b.symbol === assetSymbols.TRIBE);
  const touch = ganacheAssets.find((b) => b.symbol === assetSymbols.TOUCH);

  const assets = [weth, tribe, touch];

  const wethUnderlying = await ethers.getContract("WETH");
  const tribeUnderlying = await ethers.getContract("TRIBEToken");
  const touchUnderlying = await ethers.getContract("TOUCHToken");

  const underlyings = [wethUnderlying.address, tribeUnderlying.address, touchUnderlying.address];

  return assets.map((a, i) => {
    return {
      underlying: underlyings[i],
      fuseFeeDistributor,
      comptroller,
      adminFee: 0,
      collateralFactor: 75,
      interestRateModel: interestRateModelAddress,
      reserveFactor: 15,
      bypassPriceFeedCheck: true,
      name: a.name,
      symbol: a.symbol,
    };
  });
};

export const getBaseBscAssetsConf = (comptroller, fuseFeeDistributor, interestRateModelAddress): MarketConfig[] => {
  const btc = bscAssets.find((b) => b.symbol === assetSymbols.BTCB);
  const busd = bscAssets.find((b) => b.symbol === assetSymbols.BUSD);
  const wbnb = bscAssets.find((b) => b.symbol === assetSymbols.WBNB);
  const eth = bscAssets.find((b) => b.symbol === assetSymbols.ETH);
  const assets = [btc, busd, eth, wbnb];

  return assets.map((a) => {
    return {
      underlying: a.underlying,
      comptroller,
      fuseFeeDistributor,
      interestRateModel: interestRateModelAddress,
      name: a.name,
      symbol: a.symbol,
      collateralFactor: 75,
      reserveFactor: 15,
      adminFee: 0,
      bypassPriceFeedCheck: true,
    };
  });
};

export const getAlpacaPoolAssets = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress
): Promise<MarketConfig[]> => {
  const eth = bscAssets.find((b) => b.symbol === assetSymbols.ETH);
  const usdc = bscAssets.find((b) => b.symbol === assetSymbols.USDC);
  const busd = bscAssets.find((b) => b.symbol === assetSymbols.BUSD);
  const wbnb = bscAssets.find((b) => b.symbol === assetSymbols.WBNB);

  const assets = [eth, usdc, busd, wbnb];

  const assetConfigs = [{ plugin: undefined }, { plugin: undefined }, { plugin: undefined }, { plugin: undefined }];
  return assets.map((a, i) => {
    return {
      ...assetConfigs[i],
      underlying: a.underlying,
      comptroller,
      adminFee: 0,
      collateralFactor: 75,
      interestRateModel: interestRateModelAddress,
      reserveFactor: 15,
      bypassPriceFeedCheck: true,
      fuseFeeDistributor,
      name: a.name,
      symbol: a.symbol,
    };
  });
};

export const getJarvisPoolAssets = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress
): Promise<MarketConfig[]> => {
  const jBRL = bscAssets.find((b) => b.symbol === assetSymbols.jBRL);
  const twoBRL = bscAssets.find((b) => b.symbol === assetSymbols["2brl"]);
  const assets = [jBRL, twoBRL];

  const assetConfigs = [{}, { plugin: undefined }];

  return assets.map((a, i) => {
    return {
      ...assetConfigs[i],
      underlying: a.underlying,
      comptroller,
      adminFee: 0,
      collateralFactor: 75,
      interestRateModel: interestRateModelAddress,
      reserveFactor: 15,
      bypassPriceFeedCheck: true,
      fuseFeeDistributor,
      name: a.name,
      symbol: a.symbol,
    };
  });
};

export const getBombPoolAssets = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress
): Promise<MarketConfig[]> => {
  const sdk = await getOrCreateMidas();

  const btcb = bscAssets.find((b) => b.symbol === assetSymbols.BTCB);
  const bomb = bscAssets.find((b) => b.symbol === assetSymbols.BOMB);
  const bombbtcb = bscAssets.find((b) => b.symbol === assetSymbols["BTCB-BOMB"]);

  const assets = [btcb, bomb, bombbtcb];

  const assetConfigs = [{}, { plugin: undefined }, { plugin: undefined }];
  return assets.map((a, i) => {
    return {
      ...assetConfigs[i],
      underlying: a.underlying,
      comptroller,
      adminFee: 0,
      collateralFactor: 75,
      interestRateModel: interestRateModelAddress,
      reserveFactor: 15,
      bypassPriceFeedCheck: true,
      fuseFeeDistributor,
      name: a.name,
      symbol: a.symbol,
    };
  });
};

export const getEllipsisPoolAssets = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress
): Promise<MarketConfig[]> => {
  const val3EPS = bscAssets.find((b) => b.symbol === assetSymbols.val3EPS);
  const valdai3EPS = bscAssets.find((b) => b.symbol === assetSymbols.valdai3EPS);
  const threeEPS = bscAssets.find((b) => b.symbol === assetSymbols["3EPS"]);

  const assets = [val3EPS, threeEPS, valdai3EPS];

  const assetConfigs = [
    {
      plugin: undefined,
    },
    {
      plugin: undefined,
    },
    {
      plugin: undefined,
    },
  ];
  return assets.map((a, i) => {
    return {
      ...assetConfigs[i],
      underlying: a.underlying,
      comptroller,
      adminFee: 0,
      collateralFactor: 75,
      interestRateModel: interestRateModelAddress,
      reserveFactor: 15,
      bypassPriceFeedCheck: true,
      fuseFeeDistributor,
      name: a.name,
      symbol: a.symbol,
    };
  });
};
