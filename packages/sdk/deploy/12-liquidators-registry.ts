import { constants, providers } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { logTransaction } from "../chainDeploy/helpers/logging";

import { chainDeployConfig } from "../chainDeploy";
import { configureLiquidatorsRegistry } from "../chainDeploy/helpers/liquidators/registry";
import { AddressesProvider } from "../typechain/AddressesProvider";
import { LiquidatorsRegistry } from "../typechain/LiquidatorsRegistry";

const func: DeployFunction = async ({ ethers, getNamedAccounts, deployments, getChainId }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  let tx: providers.TransactionResponse;

  const addressesProvider = (await ethers.getContract("AddressesProvider", deployer)) as AddressesProvider;

  //// LIQUIDATORS REGISTRY
  const liquidatorsRegistryDep = await deployments.deploy("LiquidatorsRegistry", {
    from: deployer,
    log: true,
    args: [addressesProvider.address]
  });
  if (liquidatorsRegistryDep.transactionHash)
    await ethers.provider.waitForTransaction(liquidatorsRegistryDep.transactionHash);
  console.log("LiquidatorsRegistry: ", liquidatorsRegistryDep.address);
  const liquidatorsRegistryExtensionDep = await deployments.deploy("LiquidatorsRegistryExtension", {
    from: deployer,
    log: true,
    args: []
  });
  if (liquidatorsRegistryExtensionDep.transactionHash)
    await ethers.provider.waitForTransaction(liquidatorsRegistryExtensionDep.transactionHash);
  console.log("LiquidatorsRegistryExtension: ", liquidatorsRegistryExtensionDep.address);
  const liquidatorsRegistrySecondExtensionDep = await deployments.deploy("LiquidatorsRegistrySecondExtension", {
    from: deployer,
    log: true,
    args: []
  });
  if (liquidatorsRegistrySecondExtensionDep.transactionHash)
    await ethers.provider.waitForTransaction(liquidatorsRegistrySecondExtensionDep.transactionHash);
  console.log("LiquidatorsRegistrySecondExtension: ", liquidatorsRegistryExtensionDep.address);

  const liquidatorsRegistry = (await ethers.getContract("LiquidatorsRegistry", deployer)) as LiquidatorsRegistry;
  const currentLRExtensions = await liquidatorsRegistry.callStatic._listExtensions();
  if (currentLRExtensions.length == 0) {
    if ((await liquidatorsRegistry.owner()).toLowerCase() === multisig.toLowerCase()) {
      logTransaction(
        "Register First Liquidators Registry Extension",
        liquidatorsRegistry.interface.encodeFunctionData("_registerExtension", [
          liquidatorsRegistryExtensionDep.address,
          constants.AddressZero
        ])
      );
    } else {
      tx = await liquidatorsRegistry._registerExtension(liquidatorsRegistryExtensionDep.address, constants.AddressZero);
      await tx.wait();
      console.log(`registered the first liquidators registry extension ${liquidatorsRegistryExtensionDep.address}`);
    }
    if ((await liquidatorsRegistry.owner()).toLowerCase() === multisig.toLowerCase()) {
      logTransaction(
        "Register Second Liquidators Registry Extension",
        liquidatorsRegistry.interface.encodeFunctionData("_registerExtension", [
          liquidatorsRegistrySecondExtensionDep.address,
          constants.AddressZero
        ])
      );
    } else {
      tx = await liquidatorsRegistry._registerExtension(
        liquidatorsRegistrySecondExtensionDep.address,
        constants.AddressZero
      );
      await tx.wait();
      console.log(
        `registered the second liquidators registry extension ${liquidatorsRegistrySecondExtensionDep.address}`
      );
    }
  } else {
    if (currentLRExtensions.length == 1) {
      if ((await liquidatorsRegistry.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Replace Liquidators Registry First Extension",
          liquidatorsRegistry.interface.encodeFunctionData("_registerExtension", [
            liquidatorsRegistryExtensionDep.address,
            currentLRExtensions[0]
          ])
        );
      } else {
        tx = await liquidatorsRegistry._registerExtension(
          liquidatorsRegistryExtensionDep.address,
          currentLRExtensions[0]
        );
        await tx.wait();
        console.log(
          `replaced the liquidators registry first extension ${currentLRExtensions[0]} with the new ${liquidatorsRegistryExtensionDep.address}`
        );
      }
      if ((await liquidatorsRegistry.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Register Second Liquidators Registry Extension",
          liquidatorsRegistry.interface.encodeFunctionData("_registerExtension", [
            liquidatorsRegistrySecondExtensionDep.address,
            constants.AddressZero
          ])
        );
      } else {
        tx = await liquidatorsRegistry._registerExtension(
          liquidatorsRegistrySecondExtensionDep.address,
          constants.AddressZero
        );
        await tx.wait();
        console.log(
          `registered the second liquidators registry extension ${liquidatorsRegistrySecondExtensionDep.address}`
        );
      }
    } else if (currentLRExtensions.length == 2) {
      if (
        currentLRExtensions[0] != liquidatorsRegistryExtensionDep.address ||
        currentLRExtensions[1] != liquidatorsRegistrySecondExtensionDep.address
      ) {
        if (
          currentLRExtensions[1] != liquidatorsRegistryExtensionDep.address ||
          currentLRExtensions[0] != liquidatorsRegistrySecondExtensionDep.address
        ) {
          if ((await liquidatorsRegistry.owner()).toLowerCase() === multisig.toLowerCase()) {
            logTransaction(
              "Replace Liquidators Registry First Extension",
              liquidatorsRegistry.interface.encodeFunctionData("_registerExtension", [
                liquidatorsRegistryExtensionDep.address,
                currentLRExtensions[0]
              ])
            );
          } else {
            tx = await liquidatorsRegistry._registerExtension(
              liquidatorsRegistryExtensionDep.address,
              currentLRExtensions[0]
            );
            await tx.wait();
            console.log(
              `replaced the liquidators registry first extension ${currentLRExtensions[0]} with the new ${liquidatorsRegistryExtensionDep.address}`
            );
          }
          if ((await liquidatorsRegistry.owner()).toLowerCase() === multisig.toLowerCase()) {
            logTransaction(
              "Replace Liquidators Registry Second Extension",
              liquidatorsRegistry.interface.encodeFunctionData("_registerExtension", [
                liquidatorsRegistrySecondExtensionDep.address,
                currentLRExtensions[1]
              ])
            );
          } else {
            tx = await liquidatorsRegistry._registerExtension(
              liquidatorsRegistrySecondExtensionDep.address,
              currentLRExtensions[1]
            );
            await tx.wait();
            console.log(
              `replaced the liquidators registry second extension ${currentLRExtensions[1]} with the new ${liquidatorsRegistrySecondExtensionDep.address}`
            );
          }
        } else {
          console.log(`no liquidators registry extensions to update`);
        }
      }
    }
  }

  try {
    //// Configure Liquidators Registry
    await configureLiquidatorsRegistry({
      ethers,
      getNamedAccounts,
      chainId
    });
  } catch (error) {
    console.error(error);
  }
};

func.tags = ["prod", "deploy-liquidators-registry"];

export default func;
