import { cERC20Conf } from "../../dist/esm/src";
import { bscAssets } from "../../chainDeploy";
import { constants } from "ethers";

export const getAssetsConf = async (comptroller, interestRateModelAddress, ethers): Promise<cERC20Conf[]> => {
  const { chainId } = await ethers.provider.getNetwork();

  let assets: cERC20Conf[];

  if (chainId === 31337 || chainId === 1337) {
    assets = await getLocalAssetsConf(comptroller, interestRateModelAddress, ethers);
  } else if (chainId === 56) {
    assets = await getBscAssetsConf(comptroller, interestRateModelAddress, bscAssets);
  }
  return assets;
};

export const getLocalAssetsConf = async (comptroller, interestRateModelAddress, ethers) => {
  const ethConf: cERC20Conf = {
    underlying: constants.AddressZero,
    comptroller,
    interestRateModel: interestRateModelAddress,
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 20,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };

  const tribeConf: cERC20Conf = {
    underlying: await ethers.getContract("TRIBEToken").then((c) => c.address),
    comptroller,
    interestRateModel: interestRateModelAddress,
    name: "TRIBE Token",
    symbol: "TRIBE",
    decimals: 18,
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 15,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };
  const touchConf: cERC20Conf = {
    underlying: await ethers.getContract("TOUCHToken").then((c) => c.address),
    comptroller,
    interestRateModel: interestRateModelAddress,
    name: "Midas TOUCH Token",
    symbol: "TOUCH",
    decimals: 18,
    admin: "true",
    collateralFactor: 65,
    reserveFactor: 20,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };
  return [ethConf, tribeConf, touchConf];
};

export const getBscAssetsConf = async (comptroller, interestRateModelAddress, bscAssets) => {
  const btc = bscAssets.find((b) => b.symbol === "BTCB");
  const busd = bscAssets.find((b) => b.symbol === "BUSD");
  const bnbConf: cERC20Conf = {
    underlying: constants.AddressZero,
    comptroller,
    interestRateModel: interestRateModelAddress,
    name: "Binance Coin",
    symbol: "BNB",
    decimals: 18,
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 20,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };
  const btcConf: cERC20Conf = {
    underlying: btc.underlying,
    comptroller,
    interestRateModel: interestRateModelAddress,
    name: btc.name,
    symbol: btc.symbol,
    decimals: btc.decimals,
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 15,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };
  const busdConf: cERC20Conf = {
    underlying: busd.underlying,
    comptroller,
    interestRateModel: interestRateModelAddress,
    name: busd.name,
    symbol: busd.symbol,
    decimals: busd.decimals,
    admin: "true",
    collateralFactor: 75,
    reserveFactor: 15,
    adminFee: 0,
    bypassPriceFeedCheck: true,
  };
  return [bnbConf, btcConf, busdConf];
};
