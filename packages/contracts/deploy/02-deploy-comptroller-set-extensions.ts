import { DeployFunction } from "hardhat-deploy/types";
import { Address, encodeFunctionData, Hash, zeroAddress } from "viem";

import { logTransaction, prepareAndLogTransaction } from "../chainDeploy/helpers/logging";
import { chainIdtoChain } from "@ionicprotocol/chains";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments, getChainId }) => {
  const chainId = parseInt(await getChainId());
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
  const [walletClient] = await viem.getWalletClients({ chain: chainIdtoChain[chainId] });

  const oldComptroller = await deployments.getOrNull("Comptroller");
  const fuseFeeDistributor = await viem.getContractAt(
    "FeeDistributor",
    (await deployments.get("FeeDistributor")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );
  let tx: Hash;

  const comp = await deployments.deploy("Comptroller", {
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

  const compPrudentiaExtension = await deployments.deploy("ComptrollerPrudentiaCapsExt", {
    contract: "ComptrollerPrudentiaCapsExt",
    from: deployer,
    args: [],
    log: true
  });
  if (compPrudentiaExtension.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: compPrudentiaExtension.transactionHash as Hash });
  console.log("ComptrollerPrudentiaCapsExt", compPrudentiaExtension.address);

  const comptroller = await viem.getContractAt(
    "Comptroller",
    (await deployments.get("Comptroller")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );

  /// LATEST IMPLEMENTATIONS
  // Comptroller
  if (oldComptroller) {
    const latestComptrollerImplementation = await fuseFeeDistributor.read.latestComptrollerImplementation([
      oldComptroller.address as Address
    ]);
    if (latestComptrollerImplementation === zeroAddress || latestComptrollerImplementation !== comptroller.address) {
      if ((await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: fuseFeeDistributor,
          functionName: "_setLatestComptrollerImplementation",
          args: [oldComptroller.address as Address, comptroller.address],
          description: "Set Latest Comptroller Implementation",
          inputs: [
            { internalType: "address", name: "oldImplementation", type: "address" },
            { internalType: "address", name: "newImplementation", type: "address" }
          ]
        });
      } else {
        tx = await fuseFeeDistributor.write._setLatestComptrollerImplementation([
          oldComptroller.address as Address,
          comptroller.address
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
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
    if (multisig && (await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: fuseFeeDistributor,
        functionName: "_setLatestComptrollerImplementation",
        args: [zeroAddress, comptroller.address],
        description: "Set Latest Comptroller Implementation",
        inputs: [
          { internalType: "address", name: "oldImplementation", type: "address" },
          { internalType: "address", name: "newImplementation", type: "address" }
        ]
      });
    } else {
      tx = await fuseFeeDistributor.write._setLatestComptrollerImplementation([zeroAddress, comptroller.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Set the latest Comptroller implementation for ${zeroAddress} to ${comptroller.address}`);
    }
  }

  const comptrollerExtensions = await fuseFeeDistributor.read.getComptrollerExtensions([comptroller.address]);
  if (
    comptrollerExtensions.length == 0 ||
    comptrollerExtensions[1].toLowerCase() !== compFirstExtension.address.toLowerCase() ||
    comptrollerExtensions[2].toLowerCase() !== compPrudentiaExtension.address.toLowerCase()
  ) {
    if (multisig && (await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: fuseFeeDistributor,
        functionName: "_setComptrollerExtensions",
        args: [
          comptroller.address,
          [comptroller.address, compFirstExtension.address as Address, compPrudentiaExtension.address as Address]
        ],
        description: "Set Comptroller Extensions",
        inputs: [
          { internalType: "address", name: "comptroller", type: "address" },
          { internalType: "address[]", name: "extensions", type: "address[]" }
        ]
      });
    } else {
      tx = await fuseFeeDistributor.write._setComptrollerExtensions([
        comptroller.address,
        [comptroller.address, compFirstExtension.address as Address, compPrudentiaExtension.address as Address]
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`configured the extensions for comptroller ${comptroller.address}`);
    }
  } else {
    console.log(`comptroller extensions already configured`);
  }
};

func.tags = ["prod", "comptroller-setup"];

export default func;
