import { cERC20Conf, DelegateContractName } from "../../src";
import { constants } from "ethers";
import { getOrCreateFuse } from "./fuseSdk";
import { bscAssets } from "../../src/chainConfig/assets";
import { SupportedAsset } from "../../src/types";

export const getAssetsConf = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress,
  ethers
): Promise<cERC20Conf[]> => {
  const { chainId } = await ethers.provider.getNetwork();

  let assets: cERC20Conf[];

  if (chainId === 31337 || chainId === 1337) {
    assets = await getLocalAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress, ethers);
  } else if (chainId === 56) {
    assets = await getBscAssetsConf(comptroller, fuseFeeDistributor, interestRateModelAddress, bscAssets);
  }
  return assets;
};

export const getLocalAssetsConf = async (comptroller, fuseFeeDistributor, interestRateModelAddress, ethers) => {
  const ethConf: cERC20Conf = {
    underlying: constants.AddressZero,
    comptroller,
    fuseFeeDistributor,
    interestRateModel: interestRateModelAddress,
    name: "Ethereum",
    symbol: "ETH",
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 20,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };

  const tribeConf: cERC20Conf = {
    underlying: await ethers.getContract("TRIBEToken").then((c) => c.address),
    comptroller,
    fuseFeeDistributor,
    interestRateModel: interestRateModelAddress,
    name: "TRIBE Token",
    symbol: "TRIBE",
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 15,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };
  const touchConf: cERC20Conf = {
    underlying: await ethers.getContract("TOUCHToken").then((c) => c.address),
    comptroller,
    fuseFeeDistributor,
    interestRateModel: interestRateModelAddress,
    name: "Midas TOUCH Token",
    symbol: "TOUCH",
    admin: "true",
    collateralFactor: 65,
    reserveFactor: 20,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };
  return [ethConf, tribeConf, touchConf];
};

export const getBscAssetsConf = async (comptroller, fuseFeeDistributor, interestRateModelAddress, bscAssets) => {
  const btc = bscAssets.find((b) => b.symbol === "BTCB");
  const busd = bscAssets.find((b) => b.symbol === "BUSD");
  const bnbConf: cERC20Conf = {
    underlying: constants.AddressZero,
    comptroller,
    fuseFeeDistributor,
    interestRateModel: interestRateModelAddress,
    name: "Binance Coin",
    symbol: "BNB",
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 20,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };
  const btcConf: cERC20Conf = {
    underlying: btc.underlying,
    comptroller,
    fuseFeeDistributor,
    interestRateModel: interestRateModelAddress,
    name: btc.name,
    symbol: btc.symbol,
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 15,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };
  const busdConf: cERC20Conf = {
    underlying: busd.underlying,
    comptroller,
    fuseFeeDistributor,
    interestRateModel: interestRateModelAddress,
    name: busd.name,
    symbol: busd.symbol,
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 15,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };
  const erc4626Assets = await getBscPluginAssetsConf(
    comptroller,
    fuseFeeDistributor,
    interestRateModelAddress,
    bscAssets
  );
  return [bnbConf, btcConf, busdConf, ...erc4626Assets];
};

export const getBscPluginAssetsConf = async (
  comptroller,
  fuseFeeDistributor,
  interestRateModelAddress,
  bscAssets: SupportedAsset[]
) => {
  const beth = bscAssets.find((b) => b.symbol === "ETH");
  const bomb = bscAssets.find((b) => b.symbol === "BOMB");
  const sdk = await getOrCreateFuse();
  console.log({ bomb });
  console.log({ chainPlugins: sdk.chainPlugins });

  const alpacaBusdPlugin = sdk.chainPlugins[beth.underlying][0];
  const bombPlugin = sdk.chainPlugins[bomb.underlying][0];

  const bethConf: cERC20Conf = {
    delegateContractName: DelegateContractName.CErc20PluginDelegate,
    underlying: beth.underlying,
    comptroller,
    fuseFeeDistributor,
    interestRateModel: interestRateModelAddress,
    name: `alpaca ${beth.name}`,
    symbol: `m${beth.symbol}`,
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 15,
    adminFee: 0,
    bypassPriceFeedCheck: true,
    plugin: alpacaBusdPlugin.strategyAddress,
  };
  const bombConf: cERC20Conf = {
    delegateContractName: DelegateContractName.CErc20PluginDelegate,
    underlying: bomb.underlying,
    comptroller,
    fuseFeeDistributor,
    interestRateModel: interestRateModelAddress,
    name: bomb.name,
    symbol: bomb.symbol,
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 15,
    adminFee: 0,
    bypassPriceFeedCheck: true,
    plugin: bombPlugin.strategyAddress,
  };
  return [bethConf, bombConf];
};
