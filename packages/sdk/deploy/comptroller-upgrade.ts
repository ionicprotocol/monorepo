import { constants, providers, utils } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { FeeDistributor } from "../typechain/FeeDistributor.sol/FeeDistributor";
import { PoolDirectory, Unitroller } from "../typechain";
import fs from "fs";

const func: DeployFunction = async ({ run, ethers, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  console.log("RPC URL: ", ethers.provider.connection.url);
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  let MIN_BORROW_USD;
  if (chainId === 97 || chainId == 245022934) MIN_BORROW_USD = 0.1;
  else if (chainId == 34443) MIN_BORROW_USD = 4;
  else MIN_BORROW_USD = 100;

  const { deployer, multisig } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  console.log("multisig: ", multisig);
  const balance = await ethers.provider.getBalance(deployer);
  console.log("balance: ", balance.toString());
  const price = await ethers.provider.getGasPrice();
  console.log("gas price: ", ethers.utils.formatUnits(price, "gwei"));
  const feeData = await ethers.provider.getFeeData();

  console.log("fee data: ", {
    lastBaseFeePerGas: feeData.lastBaseFeePerGas?.toString(),
    maxFeePerGas: feeData.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
    gasPrice: feeData.gasPrice?.toString()
  });

  if (!chainDeployConfig[chainId]) {
    throw new Error(`Config invalid for ${chainId}`);
  }
  const { config: chainDeployParams }: { config: ChainDeployConfig; deployFunc: any } = chainDeployConfig[chainId];
  console.log("chainDeployParams: ", chainDeployParams);

  // Array to store transaction details
  const transactions: any[] = [];

  const logTransaction = (description: string, functionName: string, args: any) => {
    console.log(`Transaction: ${description}`);
    console.log(`Function: ${functionName}`);
    console.log(`Arguments: ${JSON.stringify(args)}`);

    // Store transaction details
    transactions.push({ description, functionName, args });
  };

  ////
  //// COMPOUND CORE CONTRACTS
  let tx: providers.TransactionResponse;

  const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", deployer)) as FeeDistributor;
  const oldComptroller = await ethers.getContractOrNull("Comptroller");

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
        logTransaction("Set Latest Comptroller Implementation", "_setLatestComptrollerImplementation", [
          oldComptroller.address,
          comptroller.address
        ]);
      } else {
        tx = await fuseFeeDistributor._setLatestComptrollerImplementation(oldComptroller.address, comptroller.address);
        await tx.wait();
        logTransaction(
          `Set the latest Comptroller implementation for ${oldComptroller.address} to ${comptroller.address}`,
          "_setLatestComptrollerImplementation",
          [oldComptroller.address, comptroller.address]
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
      logTransaction("Set Latest Comptroller Implementation", "_setLatestComptrollerImplementation", [
        constants.AddressZero,
        comptroller.address
      ]);
    } else {
      tx = await fuseFeeDistributor._setLatestComptrollerImplementation(constants.AddressZero, comptroller.address);
      await tx.wait();
      logTransaction(
        `Set the latest Comptroller implementation for ${constants.AddressZero} to ${comptroller.address}`,
        "_setLatestComptrollerImplementation",
        [constants.AddressZero, comptroller.address]
      );
    }
  }

  const comptrollerExtensions = await fuseFeeDistributor.callStatic.getComptrollerExtensions(comptroller.address);
  if (comptrollerExtensions.length == 0 || comptrollerExtensions[1] != compFirstExtension.address) {
    if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
      logTransaction("Set Comptroller Extensions", "_setComptrollerExtensions", [
        comptroller.address,
        [comptroller.address, compFirstExtension.address]
      ]);
    } else {
      tx = await fuseFeeDistributor._setComptrollerExtensions(comptroller.address, [
        comptroller.address,
        compFirstExtension.address
      ]);
      await tx.wait();
      logTransaction(`Configured the extensions for comptroller ${comptroller.address}`, "_setComptrollerExtensions", [
        comptroller.address,
        [comptroller.address, compFirstExtension.address]
      ]);
    }
  } else {
    console.log(`Comptroller extensions already configured`);
  }

  const poolDirectory = (await ethers.getContract("PoolDirectory", deployer)) as PoolDirectory;

  const [, pools] = await poolDirectory.callStatic.getActivePools();
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    console.log("pool", { name: pool.name, address: pool.comptroller });
    const unitroller = (await ethers.getContractAt("Unitroller", pool.comptroller, deployer)) as Unitroller;
    const admin = await unitroller.callStatic.admin();
    console.log("pool admin", admin);

    try {
      const implBefore = await unitroller.callStatic.comptrollerImplementation();
      const latestImpl = await fuseFeeDistributor.callStatic.latestComptrollerImplementation(implBefore);
      console.log(`current impl ${implBefore} latest ${latestImpl}`);

      let shouldUpgrade = implBefore !== latestImpl;

      if (shouldUpgrade) {
        logTransaction(`Would upgrade pool ${pool.comptroller}`, "_upgrade", []);
      }
    } catch (e) {
      console.error(`Error while checking for upgrade for pool ${JSON.stringify(pool)}`, e);
    }
  }

  // Write transactions to a JSON file
  fs.writeFileSync("transaction_log.json", JSON.stringify(transactions, null, 2));
};

func.tags = ["comptroller"];

export default func;
