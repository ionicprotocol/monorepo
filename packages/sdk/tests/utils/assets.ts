import { cERC20Conf } from "../../src";
import { bscAssets } from "../../chainDeploy";
import { constants } from "ethers";

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
  return [bnbConf, btcConf, busdConf];
};
