import fs from "fs";

import { DeployFunction } from "hardhat-deploy/types";
import { Address, encodeFunctionData, formatUnits, Hash, PrepareTransactionRequestReturnType, zeroAddress } from "viem";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }): Promise<void> => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  const walletClient = await viem.getWalletClient(deployer as Address);

  const chainId = parseInt(await getChainId());
  console.log("chainId: ", chainId);

  console.log("deployer: ", deployer);
  console.log("multisig: ", multisig);
  const balance = await publicClient.getBalance({ address: deployer as Address });
  console.log("balance: ", balance.toString());
  const price = await publicClient.getGasPrice();
  console.log("gas price: ", formatUnits(price, 9));

  // Array to store transaction details
  const transactions: any[] = [];

  const logTransaction = (
    description: string,
    functionName: string,
    address: string,
    populated: PrepareTransactionRequestReturnType,
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
  const fuseFeeDistributor = await viem.getContractAt(
    "FeeDistributor",
    (await deployments.get("FeeDistributor")).address as Address
  );
  const oldComptroller = await deployments.getOrNull("Comptroller");

  const comp = await deployments.deploy("Comptroller", {
    contract: "Comptroller.sol:Comptroller",
    from: deployer,
    args: [],
    log: true
  });
  if (comp.transactionHash) await publicClient.waitForTransactionReceipt({ hash: comp.transactionHash as Hash });
  console.log("Comptroller ", comp.address);

  const compFirstExtension = await deployments.deploy("ComptrollerFirstExtension", {
    contract: "ComptrollerFirstExtension",
    from: deployer,
    args: [],
    log: true
  });
  if (compFirstExtension.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: compFirstExtension.transactionHash as Hash });
  console.log("ComptrollerFirstExtension", compFirstExtension.address);

  const comptroller = await viem.getContractAt(
    "Comptroller",
    (await deployments.get("Comptroller")).address as Address
  );

  /// LATEST IMPLEMENTATIONS
  // Comptroller
  const fuseAdmin = await fuseFeeDistributor.read.owner();
  if (oldComptroller) {
    const latestComptrollerImplementation = await fuseFeeDistributor.read.latestComptrollerImplementation([
      oldComptroller.address as Address
    ]);
    if (latestComptrollerImplementation === zeroAddress || latestComptrollerImplementation !== comptroller.address) {
      if (fuseAdmin.toLowerCase() === deployer.toLowerCase()) {
        const tx = await fuseFeeDistributor.write._setLatestComptrollerImplementation([
          oldComptroller.address as Address,
          comptroller.address
        ]);
        console.log(
          `Set latest comptroller implementation from ${oldComptroller.address} to ${comptroller.address} with tx ${tx}`
        );
      } else {
        logTransaction(
          "Set Latest Comptroller Implementation",
          "_setLatestComptrollerImplementation",
          fuseFeeDistributor.address,
          await walletClient.prepareTransactionRequest({
            account: fuseAdmin,
            to: fuseFeeDistributor.address,
            data: encodeFunctionData({
              abi: fuseFeeDistributor.abi,
              functionName: "_setLatestComptrollerImplementation",
              args: [oldComptroller.address as Address, comptroller.address]
            })
          }),
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
      const tx = await fuseFeeDistributor.write._setLatestComptrollerImplementation([zeroAddress, comptroller.address]);
      console.log(`Set latest comptroller implementation from ${zeroAddress} to ${comptroller.address} with tx ${tx}`);
    } else {
      logTransaction(
        "Set Latest Comptroller Implementation",
        "_setLatestComptrollerImplementation",
        fuseFeeDistributor.address,
        await walletClient.prepareTransactionRequest({
          account: fuseAdmin,
          to: fuseFeeDistributor.address,
          data: encodeFunctionData({
            abi: fuseFeeDistributor.abi,
            functionName: "_setLatestComptrollerImplementation",
            args: [zeroAddress, comptroller.address]
          })
        }),
        [zeroAddress, comptroller.address]
      );
    }
  }

  const comptrollerExtensions = await fuseFeeDistributor.read.getComptrollerExtensions([comptroller.address]);
  if (comptrollerExtensions.length == 0 || comptrollerExtensions[1] != compFirstExtension.address) {
    if (fuseAdmin.toLowerCase() === deployer.toLowerCase()) {
      const tx = await fuseFeeDistributor.write._setComptrollerExtensions([
        comptroller.address,
        [comptroller.address, compFirstExtension.address as Address]
      ]);
      console.log(
        `Set comptroller extensions on ${comptroller.address} to ${[
          comptroller.address,
          compFirstExtension.address
        ]} with tx ${tx}`
      );
    } else {
      logTransaction(
        "Set Comptroller Extensions: ",
        "_setComptrollerExtensions",
        fuseFeeDistributor.address,
        await walletClient.prepareTransactionRequest({
          account: fuseAdmin,
          to: fuseFeeDistributor.address,
          data: encodeFunctionData({
            abi: fuseFeeDistributor.abi,
            functionName: "_setComptrollerExtensions",
            args: [comptroller.address, [comptroller.address, compFirstExtension.address as Address]]
          })
        }),
        [comptroller.address, [comptroller.address, compFirstExtension.address]]
      );
    }
  } else {
    console.log(`Comptroller extensions already configured`);
  }

  const poolDirectory = await viem.getContractAt(
    "PoolDirectory",
    (await deployments.get("PoolDirectory")).address as Address
  );

  const [, pools] = await poolDirectory.read.getActivePools();
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    console.log("pool", { name: pool.name, address: pool.comptroller });
    const unitroller = await viem.getContractAt("Unitroller", pool.comptroller as Address);
    const admin = await unitroller.read.admin();
    console.log("pool admin", admin);

    try {
      const implBefore = await unitroller.read.comptrollerImplementation();
      const latestImpl = await fuseFeeDistributor.read.latestComptrollerImplementation([implBefore]);
      console.log(`current impl ${implBefore} latest ${latestImpl}`);

      const shouldUpgrade = implBefore !== latestImpl;

      if (shouldUpgrade) {
        if (deployer == admin) {
          const tx = await unitroller.write._upgrade();
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`Upgraded pool ${pool.comptroller} with tx ${tx}`);
        } else {
          logTransaction(
            `Would upgrade pool ${pool.comptroller}`,
            "_upgrade",
            pool.comptroller,
            await walletClient.prepareTransactionRequest({
              account: admin,
              to: pool.comptroller,
              data: encodeFunctionData({
                abi: unitroller.abi,
                functionName: "_upgrade",
                args: []
              })
            }),
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
