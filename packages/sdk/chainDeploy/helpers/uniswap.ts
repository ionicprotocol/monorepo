import { constants } from "ethers";

import { AddressesProvider } from "../../lib/contracts/typechain/AddressesProvider";
import { UniswapTwapPriceOracleV2Factory } from "../../lib/contracts/typechain/UniswapTwapPriceOracleV2Factory";

import { UniswapDeployFnParams } from "./types";

export const deployUniswapOracle = async ({
  ethers,
  getNamedAccounts,
  deployments,
  deployConfig,
}: UniswapDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  const mpo = await ethers.getContract("MasterPriceOracle", deployer);
  const updateOracles = [],
    updateUnderlyings = [];
  //// Uniswap Oracle
  const utpo = await deployments.deploy("UniswapTwapPriceOracleV2", {
    from: deployer,
    args: [],
    log: true,
  });
  if (utpo.transactionHash) await ethers.provider.waitForTransaction(utpo.transactionHash);
  console.log("UniswapTwapPriceOracleV2: ", utpo.address);

  const utpor = await deployments.deploy("UniswapTwapPriceOracleV2Root", {
    from: deployer,
    args: [deployConfig.wtoken],
    log: true,
  });
  if (utpor.transactionHash) await ethers.provider.waitForTransaction(utpor.transactionHash);
  console.log("UniswapTwapPriceOracleV2Root: ", utpor.address);

  const utpof = await deployments.deploy("UniswapTwapPriceOracleV2Factory", {
    from: deployer,
    args: [utpor.address, utpo.address, deployConfig.wtoken],
    log: true,
  });
  if (utpof.transactionHash) await ethers.provider.waitForTransaction(utpof.transactionHash);
  console.log("UniswapTwapPriceOracleV2Factory: ", utpof.address);

  const uniTwapOracleFactory = (await ethers.getContract(
    "UniswapTwapPriceOracleV2Factory",
    deployer
  )) as UniswapTwapPriceOracleV2Factory;

  const existingOracle = await uniTwapOracleFactory.callStatic.oracles(
    deployConfig.uniswap.uniswapV2FactoryAddress,
    deployConfig.wtoken
  );
  if (existingOracle == constants.AddressZero) {
    // deploy oracle with wtoken as base token
    const tx = await uniTwapOracleFactory.deploy(deployConfig.uniswap.uniswapV2FactoryAddress, deployConfig.wtoken);
    await tx.wait();
  } else {
    console.log("UniswapTwapPriceOracleV2 already deployed at: ", existingOracle);
  }

  for (const tokenPair of deployConfig.uniswap.uniswapOracleInitialDeployTokens) {
    console.log("operating on pair: ", tokenPair.token, tokenPair.baseToken);
    let oldBaseTokenOracle = await uniTwapOracleFactory.callStatic.oracles(
      deployConfig.uniswap.uniswapV2FactoryAddress,
      tokenPair.baseToken
    );
    console.log(oldBaseTokenOracle, "oldBaseTokenOracle for base token", tokenPair.baseToken);
    if (oldBaseTokenOracle == constants.AddressZero) {
      const tx = await uniTwapOracleFactory.deploy(deployConfig.uniswap.uniswapV2FactoryAddress, tokenPair.baseToken);
      await tx.wait();
      oldBaseTokenOracle = await uniTwapOracleFactory.callStatic.oracles(
        deployConfig.uniswap.uniswapV2FactoryAddress,
        tokenPair.baseToken
      );
      console.log(oldBaseTokenOracle, "oldBaseTokenOracle updated?");
    }

    const underlyingOracle = await mpo.callStatic.oracles(tokenPair.token);
    console.log("underlying oracle: ", underlyingOracle, "for token: ", tokenPair.token);
    if (underlyingOracle == constants.AddressZero || underlyingOracle != oldBaseTokenOracle) {
      updateOracles.push(oldBaseTokenOracle);
      updateUnderlyings.push(tokenPair.token);
    }
  }

  if (updateOracles.length) {
    const tx = await mpo.add(updateUnderlyings, updateOracles);
    await tx.wait();
    console.log(
      `Master Price Oracle updated for tokens ${updateUnderlyings.join(", ")} with oracles ${updateOracles.join(", ")}`
    );
  }

  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;
  const tx = await addressesProvider.setAddress("UniswapTwapPriceOracleV2Factory", uniTwapOracleFactory.address);
  await tx.wait();
  console.log("setAddress: ", tx.hash);
};
