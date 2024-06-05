import fs from "fs";

import { constants, PopulatedTransaction } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";

import { PoolDirectory, Unitroller } from "../typechain";
import { FeeDistributor } from "../typechain/FeeDistributor.sol/FeeDistributor";

const func: DeployFunction = async ({ ethers, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  console.log("RPC URL: ", ethers.provider.connection.url);
  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

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

  // Array to store transaction details
  const transactions: any[] = [];

  const logTransaction = (
    description: string,
    functionName: string,
    address: string,
    populated: PopulatedTransaction,
    args: any
  ) => {
    console.log(`Target Address: ${address}`);
    console.log(`Transaction: ${description}`);
    console.log(`Function: ${functionName}`);
    console.log(`Arguments: ${JSON.stringify(args)}`);
    console.log("Populated Transaction: ", populated);

    // Store transaction details
    transactions.push({ description, functionName, args });
  };

  ////
  //// COMPOUND CORE CONTRACTS
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
  const fuseAdmin = await fuseFeeDistributor.owner();
  if (oldComptroller) {
    const latestComptrollerImplementation = await fuseFeeDistributor.callStatic.latestComptrollerImplementation(
      oldComptroller.address
    );
    if (
      latestComptrollerImplementation === constants.AddressZero ||
      latestComptrollerImplementation !== comptroller.address
    ) {
      if (fuseAdmin.toLowerCase() === deployer.toLowerCase()) {
        const tx = await fuseFeeDistributor._setLatestComptrollerImplementation(
          oldComptroller.address,
          comptroller.address
        );
        console.log(
          `Set latest comptroller implementation from ${oldComptroller.address} to ${comptroller.address} with tx ${tx.hash}`
        );
      } else {
        logTransaction(
          "Set Latest Comptroller Implementation",
          "_setLatestComptrollerImplementation",
          fuseFeeDistributor.address,
          await fuseFeeDistributor.populateTransaction._setLatestComptrollerImplementation(
            oldComptroller.address,
            comptroller.address
          ),
          [oldComptroller.address, comptroller.address]
        );
      }
    } else {
      console.log(
        `No change in the latest Comptroller implementation ${latestComptrollerImplementation} for ${comptroller.address}`
      );
    }
  } else {
    if (fuseAdmin.toLowerCase() === deployer.toLowerCase()) {
      const tx = await fuseFeeDistributor._setLatestComptrollerImplementation(
        constants.AddressZero,
        comptroller.address
      );
      console.log(
        `Set latest comptroller implementation from ${constants.AddressZero} to ${comptroller.address} with tx ${tx.hash}`
      );
    } else {
      logTransaction(
        "Set Latest Comptroller Implementation",
        "_setLatestComptrollerImplementation",
        fuseFeeDistributor.address,
        await fuseFeeDistributor.populateTransaction._setLatestComptrollerImplementation(
          constants.AddressZero,
          comptroller.address
        ),
        [constants.AddressZero, comptroller.address]
      );
    }
  }

  const comptrollerExtensions = await fuseFeeDistributor.callStatic.getComptrollerExtensions(comptroller.address);
  if (comptrollerExtensions.length == 0 || comptrollerExtensions[1] != compFirstExtension.address) {
    if (fuseAdmin.toLowerCase() === deployer.toLowerCase()) {
      const tx = await fuseFeeDistributor._setComptrollerExtensions(comptroller.address, [
        comptroller.address,
        compFirstExtension.address
      ]);
      console.log(
        `Set comptroller extensions on ${comptroller.address} to ${[
          comptroller.address,
          compFirstExtension.address
        ]} with tx ${tx.hash}`
      );
    } else {
      logTransaction(
        "Set Comptroller Extensions: ",
        "_setComptrollerExtensions",
        fuseFeeDistributor.address,
        await fuseFeeDistributor.populateTransaction._setComptrollerExtensions(comptroller.address, [
          comptroller.address,
          compFirstExtension.address
        ]),
        [comptroller.address, [comptroller.address, compFirstExtension.address]]
      );
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

      const shouldUpgrade = implBefore !== latestImpl;

      if (shouldUpgrade) {
        if (deployer == admin) {
          const tx = await unitroller._upgrade();
          await tx.wait();
          console.log(`Upgraded pool ${pool.comptroller} with tx ${tx.hash}`);
        } else {
          logTransaction(
            `Would upgrade pool ${pool.comptroller}`,
            "_upgrade",
            pool.comptroller,
            await unitroller.populateTransaction._upgrade(),
            []
          );
        }
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
