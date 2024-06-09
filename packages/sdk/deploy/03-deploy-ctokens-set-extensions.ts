import { providers, constants } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";

import { logTransaction } from "../chainDeploy/helpers/logging";
import { FeeDistributor } from "../typechain/FeeDistributor.sol/FeeDistributor";

const func: DeployFunction = async ({ ethers, getNamedAccounts, deployments }) => {
  const { deployer, multisig } = await getNamedAccounts();

  const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", deployer)) as FeeDistributor;
  let tx: providers.TransactionResponse;

  const cTokenFirstExtension = await deployments.deploy("CTokenFirstExtension", {
    contract: "CTokenFirstExtension",
    from: deployer,
    args: [],
    log: true
  });
  if (cTokenFirstExtension.transactionHash)
    await ethers.provider.waitForTransaction(cTokenFirstExtension.transactionHash);
  console.log("CTokenFirstExtension", cTokenFirstExtension.address);

  const erc20Del = await deployments.deploy("CErc20Delegate", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (erc20Del.transactionHash) await ethers.provider.waitForTransaction(erc20Del.transactionHash);
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

  const becomeImplementationData = new ethers.utils.AbiCoder().encode(["address"], [constants.AddressZero]);

  {
    // CErc20Delegate
    const erc20DelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(erc20Del.address);
    if (erc20DelExtensions.length == 0 || erc20DelExtensions[0] != erc20Del.address) {
      if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set CErc20Delegate Extensions",
          fuseFeeDistributor.interface.encodeFunctionData("_setCErc20DelegateExtensions", [
            erc20Del.address,
            [erc20Del.address, cTokenFirstExtension.address]
          ])
        );
      } else {
        tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20Del.address, [
          erc20Del.address,
          cTokenFirstExtension.address
        ]);
        await tx.wait();
        console.log(`configured the extensions for the CErc20Delegate ${erc20Del.address}`);
      }
    } else {
      console.log(`CErc20Delegate extensions already configured`);
    }
    const [latestCErc20Delegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(1);
    if (latestCErc20Delegate === constants.AddressZero || latestCErc20Delegate !== erc20Del.address) {
      if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set Latest CErc20Delegate",
          fuseFeeDistributor.interface.encodeFunctionData("_setLatestCErc20Delegate", [
            1,
            erc20Del.address,
            becomeImplementationData
          ])
        );
      } else {
        tx = await fuseFeeDistributor._setLatestCErc20Delegate(1, erc20Del.address, becomeImplementationData);
        await tx.wait();
        console.log(`Set the latest CErc20Delegate implementation from ${latestCErc20Delegate} to ${erc20Del.address}`);
      }
    } else {
      console.log(`No change in the latest CErc20Delegate implementation ${erc20Del.address}`);
    }
  }

  {
    // CErc20PluginDelegate
    const erc20PluginDelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(
      erc20PluginDel.address
    );
    if (erc20PluginDelExtensions.length == 0 || erc20PluginDelExtensions[0] != erc20PluginDel.address) {
      if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set CErc20PluginDelegate Extensions",
          fuseFeeDistributor.interface.encodeFunctionData("_setCErc20DelegateExtensions", [
            erc20PluginDel.address,
            [erc20PluginDel.address, cTokenFirstExtension.address]
          ])
        );
      } else {
        tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20PluginDel.address, [
          erc20PluginDel.address,
          cTokenFirstExtension.address
        ]);
        await tx.wait();
        console.log(`configured the extensions for the CErc20PluginDelegate ${erc20PluginDel.address}`);
      }
    } else {
      console.log(`CErc20PluginDelegate extensions already configured`);
    }

    const [latestCErc20PluginDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(2);
    if (latestCErc20PluginDelegate === constants.AddressZero || latestCErc20PluginDelegate !== erc20PluginDel.address) {
      if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set Latest CErc20PluginDelegate",
          fuseFeeDistributor.interface.encodeFunctionData("_setLatestCErc20Delegate", [
            2,
            erc20PluginDel.address,
            becomeImplementationData
          ])
        );
      } else {
        tx = await fuseFeeDistributor._setLatestCErc20Delegate(2, erc20PluginDel.address, becomeImplementationData);
        await tx.wait();
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
    const erc20RewardsDelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(
      erc20RewardsDel.address
    );
    if (erc20RewardsDelExtensions.length == 0 || erc20RewardsDelExtensions[0] != erc20RewardsDel.address) {
      if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set CErc20RewardsDelegate Extensions",
          fuseFeeDistributor.interface.encodeFunctionData("_setCErc20DelegateExtensions", [
            erc20RewardsDel.address,
            [erc20RewardsDel.address, cTokenFirstExtension.address]
          ])
        );
      } else {
        tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20RewardsDel.address, [
          erc20RewardsDel.address,
          cTokenFirstExtension.address
        ]);
        await tx.wait();
        console.log(`configured the extensions for the CErc20RewardsDelegate ${erc20RewardsDel.address}`);
      }
    } else {
      console.log(`CErc20RewardsDelegate extensions already configured`);
    }
    const [latestCErc20RewardsDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(3);
    if (
      latestCErc20RewardsDelegate === constants.AddressZero ||
      latestCErc20RewardsDelegate !== erc20RewardsDel.address
    ) {
      if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set Latest CErc20RewardsDelegate",
          fuseFeeDistributor.interface.encodeFunctionData("_setLatestCErc20Delegate", [
            3,
            erc20RewardsDel.address,
            becomeImplementationData
          ])
        );
      } else {
        tx = await fuseFeeDistributor._setLatestCErc20Delegate(3, erc20RewardsDel.address, becomeImplementationData);
        await tx.wait();
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
    const erc20PluginRewardsDelExtensions = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(
      erc20PluginRewardsDel.address
    );
    if (
      erc20PluginRewardsDelExtensions.length == 0 ||
      erc20PluginRewardsDelExtensions[0] != erc20PluginRewardsDel.address
    ) {
      if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set CErc20PluginRewardsDelegate Extensions",
          fuseFeeDistributor.interface.encodeFunctionData("_setCErc20DelegateExtensions", [
            erc20PluginRewardsDel.address,
            [erc20PluginRewardsDel.address, cTokenFirstExtension.address]
          ])
        );
      } else {
        tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20PluginRewardsDel.address, [
          erc20PluginRewardsDel.address,
          cTokenFirstExtension.address
        ]);
        await tx.wait();
        console.log(`configured the extensions for the CErc20PluginRewardsDelegate ${erc20PluginRewardsDel.address}`);
      }
    } else {
      console.log(`CErc20PluginRewardsDelegate extensions already configured`);
    }
    const [latestCErc20PluginRewardsDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(4);
    if (
      latestCErc20PluginRewardsDelegate === constants.AddressZero ||
      latestCErc20PluginRewardsDelegate !== erc20PluginRewardsDel.address
    ) {
      if ((await fuseFeeDistributor.owner()).toLowerCase() === multisig.toLowerCase()) {
        logTransaction(
          "Set Latest CErc20PluginRewardsDelegate",
          fuseFeeDistributor.interface.encodeFunctionData("_setLatestCErc20Delegate", [
            4,
            erc20PluginRewardsDel.address,
            becomeImplementationData
          ])
        );
      } else {
        tx = await fuseFeeDistributor._setLatestCErc20Delegate(
          4,
          erc20PluginRewardsDel.address,
          becomeImplementationData
        );
        await tx.wait();
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

func.tags = ["MasterPriceOracleDeployment"];

export default func;
