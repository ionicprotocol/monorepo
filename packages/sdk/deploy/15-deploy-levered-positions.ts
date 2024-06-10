import { constants, providers } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { logTransaction } from "../chainDeploy/helpers/logging";
import { AuthoritiesRegistry } from "../typechain/AuthoritiesRegistry";
import { FeeDistributor } from "../typechain/FeeDistributor.sol/FeeDistributor";
import { LeveredPositionFactory } from "../typechain/LeveredPositionFactory";
import { LiquidatorsRegistry } from "../typechain/LiquidatorsRegistry";

const func: DeployFunction = async ({ ethers, getNamedAccounts, deployments, getChainId }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }

  const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  let tx: providers.TransactionResponse;
  const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", deployer)) as FeeDistributor;
  const liquidatorsRegistry = (await ethers.getContract("LiquidatorsRegistry", deployer)) as LiquidatorsRegistry;

  //// LEVERED POSITIONS FACTORY
  if (chainId !== 1) {
    const lpfDep = await deployments.deploy("LeveredPositionFactory", {
      from: deployer,
      log: true,
      args: [fuseFeeDistributor.address, liquidatorsRegistry.address, chainDeployParams.blocksPerYear],
      waitConfirmations: 1,
      skipIfAlreadyDeployed: true
    });
    if (lpfDep.transactionHash) await ethers.provider.waitForTransaction(lpfDep.transactionHash);
    console.log("LeveredPositionFactory: ", lpfDep.address);

    const lpfExt1Dep = await deployments.deploy("LeveredPositionFactoryFirstExtension", {
      from: deployer,
      log: true,
      args: [],
      waitConfirmations: 1
    });
    if (lpfExt1Dep.transactionHash) await ethers.provider.waitForTransaction(lpfExt1Dep.transactionHash);
    console.log("LeveredPositionFactoryFirstExtension: ", lpfExt1Dep.address);

    const lpfExt2Dep = await deployments.deploy("LeveredPositionFactorySecondExtension", {
      from: deployer,
      log: true,
      args: [],
      waitConfirmations: 1
    });
    if (lpfExt2Dep.transactionHash) await ethers.provider.waitForTransaction(lpfExt2Dep.transactionHash);
    console.log("LeveredPositionFactorySecondExtension: ", lpfExt2Dep.address);

    const leveredPositionFactory = (await ethers.getContract(
      "LeveredPositionFactory",
      deployer
    )) as LeveredPositionFactory;

    const currentLPFExtensions = await leveredPositionFactory.callStatic._listExtensions();

    console.log("currentLPFExtensions: ", currentLPFExtensions.join(", "));

    if (currentLPFExtensions.length == 1) {
      if ((await leveredPositionFactory.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Replace LeveredPositionFactory First Extension",
          leveredPositionFactory.interface.encodeFunctionData("_registerExtension", [
            lpfExt1Dep.address,
            currentLPFExtensions[0]
          ])
        );
      } else {
        tx = await leveredPositionFactory._registerExtension(lpfExt1Dep.address, currentLPFExtensions[0]);
        await tx.wait();
        console.log("replaced the LeveredPositionFactory first extension: ", tx.hash);
      }
      if ((await leveredPositionFactory.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Register LeveredPositionFactory Second Extension",
          leveredPositionFactory.interface.encodeFunctionData("_registerExtension", [
            lpfExt2Dep.address,
            constants.AddressZero
          ])
        );
      } else {
        tx = await leveredPositionFactory._registerExtension(lpfExt2Dep.address, constants.AddressZero);
        await tx.wait();
        console.log("registered the LeveredPositionFactory second extension: ", tx.hash);
      }
    } else if (currentLPFExtensions.length == 2) {
      if (lpfExt1Dep.address.toLowerCase() != currentLPFExtensions[0].toLowerCase()) {
        console.log(`replacing ${currentLPFExtensions[0]} with ${lpfExt1Dep.address}`);
        if ((await leveredPositionFactory.owner()).toLowerCase() === multisig.toLowerCase()) {
          logTransaction(
            "Replace LeveredPositionFactory First Extension",
            leveredPositionFactory.interface.encodeFunctionData("_registerExtension", [
              lpfExt1Dep.address,
              currentLPFExtensions[0]
            ])
          );
        } else {
          tx = await leveredPositionFactory._registerExtension(lpfExt1Dep.address, currentLPFExtensions[0]);
          await tx.wait();
          console.log("replaced the LeveredPositionFactory first extension: ", tx.hash);
        }
      }
      if (lpfExt2Dep.address.toLowerCase() != currentLPFExtensions[1].toLowerCase()) {
        console.log(`replacing ${currentLPFExtensions[1]} with ${lpfExt2Dep.address}`);
        if ((await leveredPositionFactory.owner()).toLowerCase() === multisig.toLowerCase()) {
          logTransaction(
            "Replace LeveredPositionFactory Second Extension",
            leveredPositionFactory.interface.encodeFunctionData("_registerExtension", [
              lpfExt2Dep.address,
              currentLPFExtensions[1]
            ])
          );
        } else {
          tx = await leveredPositionFactory._registerExtension(lpfExt2Dep.address, currentLPFExtensions[1]);
          await tx.wait();
          console.log("replaced the LeveredPositionFactory second extension: ", tx.hash);
        }
      }
    } else if (currentLPFExtensions.length == 0) {
      console.log(`no LeveredPositionFactory extensions configured, adding them`);
      if ((await leveredPositionFactory.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Register LeveredPositionFactory First Extension",
          leveredPositionFactory.interface.encodeFunctionData("_registerExtension", [
            lpfExt1Dep.address,
            constants.AddressZero
          ])
        );
      } else {
        tx = await leveredPositionFactory._registerExtension(lpfExt1Dep.address, constants.AddressZero);
        await tx.wait();
        console.log("registered the LeveredPositionFactory first extension: ", tx.hash);
      }
      if ((await leveredPositionFactory.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Register LeveredPositionFactory Second Extension",
          leveredPositionFactory.interface.encodeFunctionData("_registerExtension", [
            lpfExt2Dep.address,
            constants.AddressZero
          ])
        );
      } else {
        tx = await leveredPositionFactory._registerExtension(lpfExt2Dep.address, constants.AddressZero);
        await tx.wait();
        console.log("registered the LeveredPositionFactory second extension: ", tx.hash);
      }
    } else {
      console.log(`no LeveredPositionFactory extensions to update`);
    }

    const lr = await leveredPositionFactory.callStatic.liquidatorsRegistry();
    if (lr.toLowerCase() != liquidatorsRegistry.address.toLowerCase()) {
      if ((await leveredPositionFactory.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set LiquidatorsRegistry Address",
          leveredPositionFactory.interface.encodeFunctionData("_setLiquidatorsRegistry", [liquidatorsRegistry.address])
        );
      } else {
        tx = await leveredPositionFactory._setLiquidatorsRegistry(liquidatorsRegistry.address);
        await tx.wait();
        console.log("updated the LiquidatorsRegistry address in the LeveredPositionFactory", tx.hash);
      }
    }

    //// LEVERED POSITIONS LENS
    try {
      const lpLens = await deployments.deploy("LeveredPositionsLens", {
        from: deployer,
        log: true,
        waitConfirmations: 1,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: [leveredPositionFactory.address]
            },
            onUpgrade: {
              methodName: "reinitialize",
              args: [leveredPositionFactory.address]
            }
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: multisig
        }
      });
      if (lpLens.transactionHash) await ethers.provider.waitForTransaction(lpLens.transactionHash);
      console.log("LeveredPositionsLens: ", lpLens.address);
    } catch (error) {
      console.error("Could not deploy:", error);
    }

    //// AUTHORITIES REGISTRY
    try {
      await deployments.deploy("AuthoritiesRegistry", {
        from: deployer,
        args: [],
        log: true,
        proxy: {
          execute: {
            init: {
              methodName: "initialize",
              args: [leveredPositionFactory.address]
            },
            onUpgrade: {
              methodName: "reinitialize",
              args: [leveredPositionFactory.address]
            }
          },
          proxyContract: "OpenZeppelinTransparentProxy",
          owner: multisig
        },
        waitConfirmations: 1
      });
    } catch (error) {
      console.error("Could not deploy:", error);
    }

    const authoritiesRegistry = (await ethers.getContract("AuthoritiesRegistry", deployer)) as AuthoritiesRegistry;

    const ffdAuthRegistry = await fuseFeeDistributor.callStatic.authoritiesRegistry();
    if (ffdAuthRegistry.toLowerCase() != authoritiesRegistry.address.toLowerCase()) {
      // set the address in the FFD
      if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set AuthoritiesRegistry in FeeDistributor",
          fuseFeeDistributor.interface.encodeFunctionData("reinitialize", [authoritiesRegistry.address])
        );
      } else {
        tx = await fuseFeeDistributor.reinitialize(authoritiesRegistry.address);
        await tx.wait();
        console.log(`configured the auth registry in the FFD`);
      }
    }
    const leveredPosFactoryAr = await authoritiesRegistry.callStatic.leveredPositionsFactory();
    if (leveredPosFactoryAr.toLowerCase() != leveredPositionFactory.address.toLowerCase()) {
      // set the address in the AR
      if ((await authoritiesRegistry.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set LeveredPositionsFactory in AuthoritiesRegistry",
          authoritiesRegistry.interface.encodeFunctionData("reinitialize", [leveredPositionFactory.address])
        );
      } else {
        tx = await authoritiesRegistry.reinitialize(leveredPositionFactory.address);
        await tx.wait();
        console.log(`configured the levered positions factory in the auth registry`, tx.hash);
      }
    }
    ////
  }
};

func.tags = ["prod", "deploy-levered-positions"];

export default func;
