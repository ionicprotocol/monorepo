import { DeployFunction } from "hardhat-deploy/types";
import { Address, Hash, zeroAddress } from "viem";

import { chainDeployConfig } from "../chainDeploy";
import { configureLiquidatorsRegistry } from "../chainDeploy/helpers/liquidators/registry";
import { prepareAndLogTransaction } from "../chainDeploy/helpers/logging";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }) => {
  const { deployer } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());
  const publicClient = await viem.getPublicClient();

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  let tx: Hash;

  const addressesProvider = await viem.getContractAt(
    "AddressesProvider",
    (await deployments.get("AddressesProvider")).address as Address
  );

  //// LIQUIDATORS REGISTRY
  const liquidatorsRegistryDep = await deployments.deploy("LiquidatorsRegistry", {
    from: deployer,
    log: true,
    args: [addressesProvider.address]
  });
  if (liquidatorsRegistryDep.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: liquidatorsRegistryDep.transactionHash as Hash });
  console.log("LiquidatorsRegistry: ", liquidatorsRegistryDep.address);
  const liquidatorsRegistryExtensionDep = await deployments.deploy("LiquidatorsRegistryExtension", {
    from: deployer,
    log: true,
    args: []
  });
  if (liquidatorsRegistryExtensionDep.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: liquidatorsRegistryExtensionDep.transactionHash as Hash });
  console.log("LiquidatorsRegistryExtension: ", liquidatorsRegistryExtensionDep.address);
  const liquidatorsRegistrySecondExtensionDep = await deployments.deploy("LiquidatorsRegistrySecondExtension", {
    from: deployer,
    log: true,
    args: []
  });
  if (liquidatorsRegistrySecondExtensionDep.transactionHash)
    await publicClient.waitForTransactionReceipt({
      hash: liquidatorsRegistrySecondExtensionDep.transactionHash as Hash
    });
  console.log("LiquidatorsRegistrySecondExtension: ", liquidatorsRegistryExtensionDep.address);

  const liquidatorsRegistry = await viem.getContractAt(
    "LiquidatorsRegistry",
    (await deployments.get("LiquidatorsRegistry")).address as Address
  );
  const currentLRExtensions = await liquidatorsRegistry.read._listExtensions();
  if (currentLRExtensions.length == 0) {
    if ((await liquidatorsRegistry.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: liquidatorsRegistry,
        functionName: "_registerExtension",
        args: [liquidatorsRegistryExtensionDep.address as Address, zeroAddress],
        description: "Register First Liquidators Registry Extension",
        inputs: [
          { internalType: "address", name: "extensionToAdd", type: "address" },
          { internalType: "address", name: "extensionToReplace", type: "address" }
        ]
      });
    } else {
      tx = await liquidatorsRegistry.write._registerExtension([
        liquidatorsRegistryExtensionDep.address as Address,
        zeroAddress
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`registered the first liquidators registry extension ${liquidatorsRegistryExtensionDep.address}`);
    }
    if ((await liquidatorsRegistry.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: liquidatorsRegistry,
        functionName: "_registerExtension",
        args: [liquidatorsRegistrySecondExtensionDep.address as Address, zeroAddress],
        description: "Register Second Liquidators Registry Extension",
        inputs: [
          { internalType: "address", name: "extensionToAdd", type: "address" },
          { internalType: "address", name: "extensionToReplace", type: "address" }
        ]
      });
    } else {
      tx = await liquidatorsRegistry.write._registerExtension([
        liquidatorsRegistrySecondExtensionDep.address as Address,
        zeroAddress
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(
        `registered the second liquidators registry extension ${liquidatorsRegistrySecondExtensionDep.address}`
      );
    }
  } else {
    if (currentLRExtensions.length == 1) {
      if ((await liquidatorsRegistry.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: liquidatorsRegistry,
          functionName: "_registerExtension",
          args: [liquidatorsRegistryExtensionDep.address as Address, currentLRExtensions[0]],
          description: "Replace Liquidators Registry First Extension",
          inputs: [
            { internalType: "address", name: "extensionToAdd", type: "address" },
            { internalType: "address", name: "extensionToReplace", type: "address" }
          ]
        });
      } else {
        tx = await liquidatorsRegistry.write._registerExtension([
          liquidatorsRegistryExtensionDep.address as Address,
          currentLRExtensions[0]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(
          `replaced the liquidators registry first extension ${currentLRExtensions[0]} with the new ${liquidatorsRegistryExtensionDep.address}`
        );
      }
      if ((await liquidatorsRegistry.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: liquidatorsRegistry,
          functionName: "_registerExtension",
          args: [liquidatorsRegistrySecondExtensionDep.address as Address, zeroAddress],
          description: "Register Second Liquidators Registry Extension",
          inputs: [
            { internalType: "address", name: "extensionToAdd", type: "address" },
            { internalType: "address", name: "extensionToReplace", type: "address" }
          ]
        });
      } else {
        tx = await liquidatorsRegistry.write._registerExtension([
          liquidatorsRegistrySecondExtensionDep.address as Address,
          zeroAddress
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
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
          if ((await liquidatorsRegistry.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
            await prepareAndLogTransaction({
              contractInstance: liquidatorsRegistry,
              functionName: "_registerExtension",
              args: [liquidatorsRegistryExtensionDep.address as Address, currentLRExtensions[0]],
              description: "Replace Liquidators Registry First Extension",
              inputs: [
                { internalType: "address", name: "extensionToAdd", type: "address" },
                { internalType: "address", name: "extensionToReplace", type: "address" }
              ]
            });
          } else {
            tx = await liquidatorsRegistry.write._registerExtension([
              liquidatorsRegistryExtensionDep.address as Address,
              currentLRExtensions[0]
            ]);
            await publicClient.waitForTransactionReceipt({ hash: tx });
            console.log(
              `replaced the liquidators registry first extension ${currentLRExtensions[0]} with the new ${liquidatorsRegistryExtensionDep.address}`
            );
          }
          if ((await liquidatorsRegistry.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
            await prepareAndLogTransaction({
              contractInstance: liquidatorsRegistry,
              functionName: "_registerExtension",
              args: [liquidatorsRegistrySecondExtensionDep.address as Address, currentLRExtensions[1]],
              description: "Replace Liquidators Registry Second Extension",
              inputs: [
                { internalType: "address", name: "extensionToAdd", type: "address" },
                { internalType: "address", name: "extensionToReplace", type: "address" }
              ]
            });
          } else {
            tx = await liquidatorsRegistry.write._registerExtension([
              liquidatorsRegistrySecondExtensionDep.address as Address,
              currentLRExtensions[1]
            ]);
            await publicClient.waitForTransactionReceipt({ hash: tx });
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
      viem,
      getNamedAccounts,
      chainId,
      deployments
    });
  } catch (error) {
    console.error(error);
  }
};

func.tags = ["prod", "deploy-liquidators-registry"];

export default func;
