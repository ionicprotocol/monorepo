import { DeployFunction } from "hardhat-deploy/types";
import { Address, encodeAbiParameters, Hash, parseAbiParameters, zeroAddress } from "viem";

import { prepareAndLogTransaction } from "../chainDeploy/helpers/logging";

const func: DeployFunction = async ({ viem, getNamedAccounts, deployments }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const publicClient = await viem.getPublicClient();
  const walletClient = await viem.getWalletClient(deployer as Address);

  const fuseFeeDistributor = await viem.getContractAt(
    "FeeDistributor",
    (await deployments.get("FeeDistributor")).address as Address
  );
  let tx: Hash;

  const cTokenFirstExtension = await deployments.deploy("CTokenFirstExtension", {
    contract: "CTokenFirstExtension",
    from: deployer,
    args: [],
    log: true
  });
  if (cTokenFirstExtension.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: cTokenFirstExtension.transactionHash as Hash });
  console.log("CTokenFirstExtension", cTokenFirstExtension.address);

  const erc20Del = await deployments.deploy("CErc20Delegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (erc20Del.transactionHash)
    await publicClient.waitForTransactionReceipt({ hash: erc20Del.transactionHash as Hash });
  console.log("CErc20Delegate: ", erc20Del.address);

  const erc20PluginDel = await deployments.deploy("CErc20PluginDelegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("CErc20PluginDelegate: ", erc20PluginDel.address);

  const erc20RewardsDel = await deployments.deploy("CErc20RewardsDelegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("CErc20RewardsDelegate: ", erc20RewardsDel.address);

  const erc20PluginRewardsDel = await deployments.deploy("CErc20PluginRewardsDelegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("CErc20PluginRewardsDelegate: ", erc20PluginRewardsDel.address);

  const becomeImplementationData = encodeAbiParameters(parseAbiParameters("address"), [zeroAddress]);

  {
    // CErc20Delegate
    const erc20DelExtensions = await fuseFeeDistributor.read.getCErc20DelegateExtensions([erc20Del.address as Address]);
    const owner = await fuseFeeDistributor.read.owner();
    if (erc20DelExtensions.length == 0 || erc20DelExtensions[0] != erc20Del.address) {
      if (owner.toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: fuseFeeDistributor,
          functionName: "_setCErc20DelegateExtensions",
          args: [erc20Del.address as Address, [erc20Del.address as Address, cTokenFirstExtension.address as Address]],
          description: "Set CErc20Delegate Extensions",
          inputs: [
            { internalType: "address", name: "cErc20Delegate", type: "address" },
            { internalType: "address[]", name: "extensions", type: "address[]" }
          ]
        });
      } else {
        tx = await fuseFeeDistributor.write._setCErc20DelegateExtensions([
          erc20Del.address as Address,
          [erc20Del.address as Address, cTokenFirstExtension.address as Address]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`configured the extensions for the CErc20Delegate ${erc20Del.address}`);
      }
    } else {
      console.log(`CErc20Delegate extensions already configured`);
    }
    const [latestCErc20Delegate] = await fuseFeeDistributor.read.latestCErc20Delegate([1]);
    if (latestCErc20Delegate === zeroAddress || latestCErc20Delegate !== erc20Del.address) {
      if ((await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: fuseFeeDistributor,
          functionName: "_setLatestCErc20Delegate",
          args: [1, erc20Del.address as Address, becomeImplementationData],
          description: "Set Latest CErc20Delegate",
          inputs: [
            { internalType: "uint8", name: "delegateType", type: "uint8" },
            { internalType: "address", name: "newImplementation", type: "address" },
            { internalType: "bytes", name: "becomeImplementationData", type: "bytes" }
          ]
        });
      } else {
        tx = await fuseFeeDistributor.write._setLatestCErc20Delegate([
          1,
          erc20Del.address as Address,
          becomeImplementationData
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`Set the latest CErc20Delegate implementation from ${latestCErc20Delegate} to ${erc20Del.address}`);
      }
    } else {
      console.log(`No change in the latest CErc20Delegate implementation ${erc20Del.address}`);
    }
  }

  {
    // CErc20PluginDelegate
    const erc20PluginDelExtensions = await fuseFeeDistributor.read.getCErc20DelegateExtensions([
      erc20PluginDel.address as Address
    ]);
    if (erc20PluginDelExtensions.length == 0 || erc20PluginDelExtensions[0] != erc20PluginDel.address) {
      if ((await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: fuseFeeDistributor,
          functionName: "_setCErc20DelegateExtensions",
          args: [
            erc20PluginDel.address as Address,
            [erc20PluginDel.address as Address, cTokenFirstExtension.address as Address]
          ],
          description: "Set CErc20PluginDelegate Extensions",
          inputs: [
            { internalType: "address", name: "cErc20Delegate", type: "address" },
            { internalType: "address[]", name: "extensions", type: "address[]" }
          ]
        });
      } else {
        tx = await fuseFeeDistributor.write._setCErc20DelegateExtensions([
          erc20PluginDel.address as Address,
          [erc20PluginDel.address as Address, cTokenFirstExtension.address as Address]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`configured the extensions for the CErc20PluginDelegate ${erc20PluginDel.address}`);
      }
    } else {
      console.log(`CErc20PluginDelegate extensions already configured`);
    }

    const [latestCErc20PluginDelegate] = await fuseFeeDistributor.read.latestCErc20Delegate([2]);
    if (latestCErc20PluginDelegate === zeroAddress || latestCErc20PluginDelegate !== erc20PluginDel.address) {
      if ((await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: fuseFeeDistributor,
          functionName: "_setLatestCErc20Delegate",
          args: [2, erc20PluginDel.address as Address, becomeImplementationData],
          description: "Set Latest CErc20PluginDelegate",
          inputs: [
            { internalType: "uint8", name: "delegateType", type: "uint8" },
            { internalType: "address", name: "newImplementation", type: "address" },
            { internalType: "bytes", name: "becomeImplementationData", type: "bytes" }
          ]
        });
      } else {
        tx = await fuseFeeDistributor.write._setLatestCErc20Delegate([
          2,
          erc20PluginDel.address as Address,
          becomeImplementationData
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(
          `Set the latest CErc20PluginDelegate implementation from ${latestCErc20PluginDelegate} to ${erc20PluginDel.address}`
        );
      }
    } else {
      console.log(`No change in the latest CErc20PluginDelegate implementation ${erc20PluginDel.address}`);
    }
  }

  {
    // CErc20RewardsDelegate
    const erc20RewardsDelExtensions = await fuseFeeDistributor.read.getCErc20DelegateExtensions([
      erc20RewardsDel.address as Address
    ]);
    if (erc20RewardsDelExtensions.length == 0 || erc20RewardsDelExtensions[0] != erc20RewardsDel.address) {
      if ((await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: fuseFeeDistributor,
          functionName: "_setCErc20DelegateExtensions",
          args: [
            erc20RewardsDel.address as Address,
            [erc20RewardsDel.address as Address, cTokenFirstExtension.address as Address]
          ],
          description: "Set CErc20RewardsDelegate Extensions",
          inputs: [
            { internalType: "address", name: "cErc20Delegate", type: "address" },
            { internalType: "address[]", name: "extensions", type: "address[]" }
          ]
        });
      } else {
        tx = await fuseFeeDistributor.write._setCErc20DelegateExtensions([
          erc20RewardsDel.address as Address,
          [erc20RewardsDel.address as Address, cTokenFirstExtension.address as Address]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`configured the extensions for the CErc20RewardsDelegate ${erc20RewardsDel.address}`);
      }
    } else {
      console.log(`CErc20RewardsDelegate extensions already configured`);
    }
    const [latestCErc20RewardsDelegate] = await fuseFeeDistributor.read.latestCErc20Delegate([3]);
    if (latestCErc20RewardsDelegate === zeroAddress || latestCErc20RewardsDelegate !== erc20RewardsDel.address) {
      if ((await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: fuseFeeDistributor,
          functionName: "_setLatestCErc20Delegate",
          args: [3, erc20RewardsDel.address as Address, becomeImplementationData],
          description: "Set Latest CErc20RewardsDelegate",
          inputs: [
            { internalType: "uint8", name: "delegateType", type: "uint8" },
            { internalType: "address", name: "newImplementation", type: "address" },
            { internalType: "bytes", name: "becomeImplementationData", type: "bytes" }
          ]
        });
      } else {
        tx = await fuseFeeDistributor.write._setLatestCErc20Delegate([
          3,
          erc20RewardsDel.address as Address,
          becomeImplementationData
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(
          `Set the latest CErc20RewardsDelegate implementation from ${latestCErc20RewardsDelegate} to ${erc20RewardsDel.address}`
        );
      }
    } else {
      console.log(`No change in the latest CErc20RewardsDelegate implementation ${erc20RewardsDel.address}`);
    }
  }

  {
    // CErc20PluginRewardsDelegate
    const erc20PluginRewardsDelExtensions = await fuseFeeDistributor.read.getCErc20DelegateExtensions([
      erc20PluginRewardsDel.address as Address
    ]);
    if (
      erc20PluginRewardsDelExtensions.length == 0 ||
      erc20PluginRewardsDelExtensions[0] != erc20PluginRewardsDel.address
    ) {
      if ((await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: fuseFeeDistributor,
          functionName: "_setCErc20DelegateExtensions",
          args: [
            erc20PluginRewardsDel.address as Address,
            [erc20PluginRewardsDel.address as Address, cTokenFirstExtension.address as Address]
          ],
          description: "Set CErc20PluginRewardsDelegate Extensions",
          inputs: [
            { internalType: "address", name: "cErc20Delegate", type: "address" },
            { internalType: "address[]", name: "extensions", type: "address[]" }
          ]
        });
      } else {
        tx = await fuseFeeDistributor.write._setCErc20DelegateExtensions([
          erc20PluginRewardsDel.address as Address,
          [erc20PluginRewardsDel.address as Address, cTokenFirstExtension.address as Address]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`configured the extensions for the CErc20PluginRewardsDelegate ${erc20PluginRewardsDel.address}`);
      }
    } else {
      console.log(`CErc20PluginRewardsDelegate extensions already configured`);
    }
    const [latestCErc20PluginRewardsDelegate] = await fuseFeeDistributor.read.latestCErc20Delegate([4]);
    if (
      latestCErc20PluginRewardsDelegate === zeroAddress ||
      latestCErc20PluginRewardsDelegate !== erc20PluginRewardsDel.address
    ) {
      if ((await fuseFeeDistributor.read.owner()).toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: fuseFeeDistributor,
          functionName: "_setLatestCErc20Delegate",
          args: [4, erc20PluginRewardsDel.address as Address, becomeImplementationData],
          description: "Set Latest CErc20PluginRewardsDelegate",
          inputs: [
            { internalType: "uint8", name: "delegateType", type: "uint8" },
            { internalType: "address", name: "newImplementation", type: "address" },
            { internalType: "bytes", name: "becomeImplementationData", type: "bytes" }
          ]
        });
      } else {
        tx = await fuseFeeDistributor.write._setLatestCErc20Delegate([
          4,
          erc20PluginRewardsDel.address as Address,
          becomeImplementationData
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(
          `Set the latest CErc20PluginRewardsDelegate implementation from ${latestCErc20PluginRewardsDelegate} to ${erc20PluginRewardsDel.address}`
        );
      }
    } else {
      console.log(
        `No change in the latest CErc20PluginRewardsDelegate implementation ${erc20PluginRewardsDel.address}`
      );
    }
  }
};

func.tags = ["prod", "market-setup"];

export default func;
