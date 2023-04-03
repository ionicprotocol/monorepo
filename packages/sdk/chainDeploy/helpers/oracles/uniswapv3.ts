import { AddressesProvider } from "../../../typechain/AddressesProvider";
import { ConcentratedLiquidityBasePriceOracle } from "../../../typechain/ConcentratedLiquidityBasePriceOracle";
import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { UniswapV3PriceOracle } from "../../../typechain/UniswapV3PriceOracle";
import { UniswapV3OracleConfig, UniswaV3DeployFnParams } from "../types";

import { addUnderlyingsToMpo } from "./utils";

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
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [deployConfig.wtoken, [deployConfig.stableToken]],
        },
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });

  if (utpo.transactionHash) await ethers.provider.waitForTransaction(utpo.transactionHash);
  console.log("UniswapV3PriceOracle: ", utpo.address);

  const uniswapV3Oracle = (await ethers.getContract("UniswapV3PriceOracle", deployer)) as UniswapV3PriceOracle;

  const assetsToAdd: UniswapV3OracleConfig[] = [];
  for (const assetConfig of deployConfig.uniswap.uniswapV3OracleTokens!) {
    const existingOracleAssetConfig: ConcentratedLiquidityBasePriceOracle.AssetConfigStruct =
      await uniswapV3Oracle.callStatic.poolFeeds(assetConfig.assetAddress);
    if (
      existingOracleAssetConfig.poolAddress != assetConfig.poolAddress ||
      existingOracleAssetConfig.twapWindow != assetConfig.twapWindow ||
      existingOracleAssetConfig.baseToken != assetConfig.baseToken
    ) {
      assetsToAdd.push(assetConfig);
    }
  }

  // set pool feeds
  if (assetsToAdd.length > 0) {
    // Check the base tokens
    const baseTokens = assetsToAdd.map((assetConfig) => assetConfig.baseToken);
    const supportedBaseTokens = await uniswapV3Oracle.callStatic.getSupportedBaseTokens();
    const baseTokensToAdd = baseTokens.filter(
      (baseToken) => !supportedBaseTokens.includes(baseToken) && baseToken !== deployConfig.wtoken
    );
    if (baseTokensToAdd.length > 0) {
      // set them if needed
      console.log("Adding base tokens to UniswapV3 Oracle: ", baseTokensToAdd.join(", "));
      const tx = await uniswapV3Oracle._setSupportedBaseTokens([...baseTokensToAdd, ...supportedBaseTokens]);
      await tx.wait();
    }
    const underlyings = assetsToAdd.map((assetConfig) => assetConfig.assetAddress);
    const feedConfigs = assetsToAdd.map((assetConfig) => {
      return {
        poolAddress: assetConfig.poolAddress,
        twapWindow: assetConfig.twapWindow,
        baseToken: assetConfig.baseToken,
      };
    });
    const tx = await uniswapV3Oracle.setPoolFeeds(underlyings, feedConfigs);
    await tx.wait();
    console.log(`UniswapV3 Oracle updated for tokens: ${underlyings.join(",")}`);
  }

  // set mpo addresses
  const underlyings = assetsToAdd.map((assetConfig) => assetConfig.assetAddress);
  await addUnderlyingsToMpo(mpo, underlyings, uniswapV3Oracle.address);

  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  const uniswapV3PriceOracleAddress = await addressesProvider.callStatic.getAddress("UniswapV3PriceOracle");
  if (uniswapV3PriceOracleAddress !== uniswapV3Oracle.address) {
    const tx = await addressesProvider.setAddress("UniswapV3PriceOracle", uniswapV3Oracle.address);
    await tx.wait();
    console.log("setAddress UniswapV3PriceOracle: ", tx.hash);
  }
};
