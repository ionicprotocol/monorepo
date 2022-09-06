import { constants } from "ethers";

import { AddressesProvider } from "../../../lib/contracts/typechain/AddressesProvider";
import { MasterPriceOracle } from "../../../lib/contracts/typechain/MasterPriceOracle";
import { UniswapV3PriceOracle } from "../../../lib/contracts/typechain/UniswapV3PriceOracle";
import { UniswaV3DeployFnParams } from "../types";

export const deployUniswapV3Oracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}: UniswaV3DeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;

  //// Uniswap Oracle
  const utpo = await deployments.deploy("UniswapV3PriceOracle", {
    from: deployer,
    args: [],
    log: true,
  });
  if (utpo.transactionHash) await ethers.provider.waitForTransaction(utpo.transactionHash);
  console.log("UniswapV3PriceOracle: ", utpo.address);

  const uniswapV3Oracle = (await ethers.getContract("UniswapV3PriceOracle", deployer)) as UniswapV3PriceOracle;

  const assetsToAdd = [];
  for (const assetConfig of deployConfig.uniswap.uniswapV3OracleTokens) {
    const existingOracleAssetConfig = await uniswapV3Oracle.callStatic.poolFeeds(assetConfig.assetAddress);
    if (existingOracleAssetConfig.poolAddress == constants.AddressZero) {
      assetsToAdd.push(assetConfig);
    }
  }
  // set pool feeds
  if (assetsToAdd.length > 0) {
    const underlyings = assetsToAdd.map((assetConfig) => assetConfig.assetAddress);
    const tx = await uniswapV3Oracle.setPoolFeeds(underlyings, assetsToAdd);
    await tx.wait();
  }

  // set mpo addresses
  if (assetsToAdd.length > 0) {
    const underlyings = assetsToAdd.map((assetConfig) => assetConfig.assetAddress);
    const oracleAddresses = Array(underlyings.length).fill(uniswapV3Oracle.address);
    const tx = await mpo.add(underlyings, oracleAddresses);
    await tx.wait();
    console.log(`Master Price Oracle updated for token ${underlyings.join(",")}`);
  }

  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  const uniswapV3PriceOracleAddress = await addressesProvider.callStatic.getAddress("UniswapV3PriceOracle");
  if (uniswapV3PriceOracleAddress !== uniswapV3Oracle.address) {
    const tx = await addressesProvider.setAddress("UniswapV3PriceOracle", uniswapV3Oracle.address);
    await tx.wait();
    console.log("setAddress UniswapV3PriceOracle: ", tx.hash);
  }
};
