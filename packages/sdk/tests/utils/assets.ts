import { bsc, chapel, ganache, neondevnet } from "@midas-capital/chains";
import { assetSymbols, MarketConfig, SupportedChains } from "@midas-capital/types";
import { ethers } from "hardhat";

export const getAssetsConf = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress,
  ethers
): Promise<MarketConfig[]> => {
  const { chainId } = await ethers.provider.getNetwork();

  let assets: MarketConfig[];

  if (chainId === 31337 || chainId === 1337) {
    assets = await getLocalAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress);
  } else if (chainId === SupportedChains.bsc) {
    assets = getBaseBscAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress);
  } else if (chainId == SupportedChains.chapel) {
    assets = await getChapelAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress);
  } else if (chainId == SupportedChains.neon_devnet) {
    assets = await getNeonAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress);
  }
  return assets;
};

export const getNeonAssetsConf = async (comptroller, fuseFeeDistributor, interestRateModelAddress) => {
  const wneon = neondevnet.assets.find((b) => b.symbol === assetSymbols.WNEON);
  const wbtc = chapel.assets.find((b) => b.symbol === assetSymbols.WBTC);
  const weth = chapel.assets.find((b) => b.symbol === assetSymbols.WETH);
  const usdc = chapel.assets.find((b) => b.symbol === assetSymbols.USDC);
  const assets = [wneon, wbtc, weth, usdc];

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

export const getChapelAssetsConf = async (comptroller, fuseFeeDistributor, interestRateModelAddress) => {
  const btc = chapel.assets.find((b) => b.symbol === assetSymbols.BTCB);
  const busd = chapel.assets.find((b) => b.symbol === assetSymbols.BUSD);
  const wbnb = chapel.assets.find((b) => b.symbol === assetSymbols.WBNB);
  const safemoon = chapel.assets.find((b) => b.symbol === assetSymbols.SAFEMOON);
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
  const weth = ganache.assets.find((b) => b.symbol === assetSymbols.WETH);
  const tribe = ganache.assets.find((b) => b.symbol === assetSymbols.TRIBE);
  const touch = ganache.assets.find((b) => b.symbol === assetSymbols.TOUCH);

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
  const btc = bsc.assets.find((b) => b.symbol === assetSymbols.BTCB);
  const busd = bsc.assets.find((b) => b.symbol === assetSymbols.BUSD);
  const wbnb = bsc.assets.find((b) => b.symbol === assetSymbols.WBNB);
  const eth = bsc.assets.find((b) => b.symbol === assetSymbols.ETH);
  const usdc = bsc.assets.find((b) => b.symbol === assetSymbols.USDC);
  const assets = [btc, busd, eth, wbnb, usdc];

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
