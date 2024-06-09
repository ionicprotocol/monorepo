import { providers, constants } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";

import { logTransaction } from "../chainDeploy/helpers/logging";
import { FeeDistributor } from "../typechain/FeeDistributor.sol/FeeDistributor";

const func: DeployFunction = async ({ ethers, getNamedAccounts, deployments }) => {
  const { deployer, multisig } = await getNamedAccounts();

  const oldComptroller = await ethers.getContractOrNull("Comptroller");
  const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", deployer)) as FeeDistributor;
  let tx: providers.TransactionResponse;

  const comp = await deployments.deploy("Comptroller", {
    contract: "Comptroller.sol:Comptroller",
    from: deployer,
    args: [],
    log: true
  });
  if (comp.transactionHash) await ethers.provider.waitForTransaction(comp.transactionHash);
  console.log("Comptroller ", comp.address);

  const compFirstExtension = await deployments.deploy("ComptrollerFirstExtension", {
    contract: "ComptrollerFirstExtension",
    from: deployer,
    args: [],
    log: true
  });
  if (compFirstExtension.transactionHash) await ethers.provider.waitForTransaction(compFirstExtension.transactionHash);
  console.log("ComptrollerFirstExtension", compFirstExtension.address);

  const comptroller = await ethers.getContract("Comptroller", deployer);

  /// LATEST IMPLEMENTATIONS
  // Comptroller
  if (oldComptroller) {
    const latestComptrollerImplementation = await fuseFeeDistributor.callStatic.latestComptrollerImplementation(
      oldComptroller.address
    );
    if (
      latestComptrollerImplementation === constants.AddressZero ||
      latestComptrollerImplementation !== comptroller.address
    ) {
      if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set Latest Comptroller Implementation",
          fuseFeeDistributor.interface.encodeFunctionData("_setLatestComptrollerImplementation", [
            oldComptroller.address,
            comptroller.address
          ])
        );
      } else {
        tx = await fuseFeeDistributor._setLatestComptrollerImplementation(oldComptroller.address, comptroller.address);
        await tx.wait();
        console.log(
          `Set the latest Comptroller implementation for ${oldComptroller.address} to ${comptroller.address}`
        );
      }
    } else {
      console.log(
        `No change in the latest Comptroller implementation ${latestComptrollerImplementation} for ${comptroller.address}`
      );
    }
  } else {
    // on the first deploy to a chain
    if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
      logTransaction(
        "Set Latest Comptroller Implementation",
        fuseFeeDistributor.interface.encodeFunctionData("_setLatestComptrollerImplementation", [
          constants.AddressZero,
          comptroller.address
        ])
      );
    } else {
      tx = await fuseFeeDistributor._setLatestComptrollerImplementation(constants.AddressZero, comptroller.address);
      await tx.wait();
      console.log(`Set the latest Comptroller implementation for ${constants.AddressZero} to ${comptroller.address}`);
    }
  }

  const comptrollerExtensions = await fuseFeeDistributor.callStatic.getComptrollerExtensions(comptroller.address);
  if (comptrollerExtensions.length == 0 || comptrollerExtensions[1] != compFirstExtension.address) {
    if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
      logTransaction(
        "Set Comptroller Extensions",
        fuseFeeDistributor.interface.encodeFunctionData("_setComptrollerExtensions", [
          comptroller.address,
          [comptroller.address, compFirstExtension.address]
        ])
      );
    } else {
      tx = await fuseFeeDistributor._setComptrollerExtensions(comptroller.address, [
        comptroller.address,
        compFirstExtension.address
      ]);
      await tx.wait();
      console.log(`configured the extensions for comptroller ${comptroller.address}`);
    }
  } else {
    console.log(`comptroller extensions already configured`);
  }
};

func.tags = ["MasterPriceOracleDeployment"];

export default func;
