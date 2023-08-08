import { AddressesProvider } from "../../../typechain/AddressesProvider";
import { AlgebraPriceOracle } from "../../../typechain/AlgebraPriceOracle";
import { ConcentratedLiquidityBasePriceOracle } from "../../../typechain/ConcentratedLiquidityBasePriceOracle";
import { MasterPriceOracle } from "../../../typechain/MasterPriceOracle";
import { UniswapV3PriceOracle } from "../../../typechain/UniswapV3PriceOracle";
import { ChainDeployConfig, ConcentratedLiquidityDeployFnParams, ConcentratedLiquidityOracleConfig } from "../types";

import { addUnderlyingsToMpo } from "./utils";

export const deployAlgebraPriceOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  concentratedLiquidityOracleTokens
}: ConcentratedLiquidityDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;

  //// Uniswap Oracle
  const apo = await deployments.deploy("AlgebraPriceOracle", {
    from: deployer,
    args: [],
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [deployConfig.wtoken, [deployConfig.stableToken]]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });

  if (apo.transactionHash) await ethers.provider.waitForTransaction(apo.transactionHash);
  console.log("AlgebraPriceOracle: ", apo.address);

  const algebraOracle = (await ethers.getContract("AlgebraPriceOracle", deployer)) as AlgebraPriceOracle;
  const assetsToAdd = await configureOracle(algebraOracle, concentratedLiquidityOracleTokens, deployConfig);

  // set mpo addresses
  const underlyings = assetsToAdd.map((assetConfig) => assetConfig.assetAddress);
  await addUnderlyingsToMpo(mpo, underlyings, algebraOracle.address);
};

export const deployUniswapV3Oracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
  concentratedLiquidityOracleTokens
}: ConcentratedLiquidityDeployFnParams): Promise<void> => {
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
          args: [deployConfig.wtoken, [deployConfig.stableToken]]
        }
      },
      owner: deployer,
      proxyContract: "OpenZeppelinTransparentProxy"
    }
  });

  if (utpo.transactionHash) await ethers.provider.waitForTransaction(utpo.transactionHash);
  console.log("UniswapV3PriceOracle: ", utpo.address);

  const uniswapV3Oracle = (await ethers.getContract("UniswapV3PriceOracle", deployer)) as UniswapV3PriceOracle;
  await configureOracle(uniswapV3Oracle, concentratedLiquidityOracleTokens, deployConfig);

  // set mpo addresses
  const underlyings = concentratedLiquidityOracleTokens.map((assetConfig) => assetConfig.assetAddress);
  await addUnderlyingsToMpo(mpo, underlyings, uniswapV3Oracle.address);

  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  const uniswapV3PriceOracleAddress = await addressesProvider.callStatic.getAddress("UniswapV3PriceOracle");
  if (uniswapV3PriceOracleAddress !== uniswapV3Oracle.address) {
    const tx = await addressesProvider.setAddress("UniswapV3PriceOracle", uniswapV3Oracle.address);
    await tx.wait();
    console.log("setAddress UniswapV3PriceOracle: ", tx.hash);
  }
};

async function configureOracle(
  oracle: AlgebraPriceOracle | UniswapV3PriceOracle,
  tokens: ConcentratedLiquidityOracleConfig[],
  deployConfig: ChainDeployConfig
) {
  const assetsToAdd: ConcentratedLiquidityOracleConfig[] = [];
  for (const assetConfig of tokens) {
    const existingOracleAssetConfig: ConcentratedLiquidityBasePriceOracle.AssetConfigStruct =
      await oracle.callStatic.poolFeeds(assetConfig.assetAddress);

    if (
      existingOracleAssetConfig.poolAddress.toString().toLowerCase() != assetConfig.poolAddress.toLowerCase() ||
      existingOracleAssetConfig.twapWindow.toString() != assetConfig.twapWindow.toString() ||
      existingOracleAssetConfig.baseToken.toString().toLowerCase() != assetConfig.baseToken.toString().toLowerCase()
    ) {
      console.log(`Updating Concentrated Liquidity Oracle for token: ${assetConfig.assetAddress}`);
      assetsToAdd.push(assetConfig);
    }
  }

  // set pool feeds
  if (assetsToAdd.length > 0) {
    // Check the base tokens
    const baseTokens = assetsToAdd.map((assetConfig) => assetConfig.baseToken);
    const supportedBaseTokens = await oracle.callStatic.getSupportedBaseTokens();
    const baseTokensToAdd = baseTokens.filter(
      (baseToken) => !supportedBaseTokens.includes(baseToken) && baseToken !== deployConfig.wtoken
    );
    if (baseTokensToAdd.length > 0) {
      // set them if needed
      console.log("Adding base tokens to Concentrated Liquidity Oracle: ", baseTokensToAdd.join(", "));
      const tx = await oracle._setSupportedBaseTokens([...baseTokensToAdd, ...supportedBaseTokens]);
      await tx.wait();
    }
    const underlyings = assetsToAdd.map((assetConfig) => assetConfig.assetAddress);
    const feedConfigs = assetsToAdd.map((assetConfig) => {
      return {
        poolAddress: assetConfig.poolAddress,
        twapWindow: assetConfig.twapWindow,
        baseToken: assetConfig.baseToken
      };
    });
    const tx = await oracle.setPoolFeeds(underlyings, feedConfigs);
    await tx.wait();
    console.log(`Concentrated Liquidity Oracle updated for tokens: ${underlyings.join(",")}`);
  }
  return assetsToAdd;
}
