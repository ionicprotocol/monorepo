import { constants } from "ethers";
import { task } from "hardhat/config";

import { CTokenFirstExtension } from "../../typechain/CTokenFirstExtension";
import { FeeDistributor } from "../../typechain/FeeDistributor";

task("market:set-latest", "Updates the markets' implementations whitelist")
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");

    const fuseFeeDistributor = (await ethers.getContract("FeeDistributor", signer)) as FeeDistributor;
    const erc20Delegate = await ethers.getContract("CErc20Delegate", signer);
    const erc20PluginDelegate = await ethers.getContract("CErc20PluginDelegate", signer);
    const erc20PluginRewardsDelegate = await ethers.getContract("CErc20PluginRewardsDelegate", signer);

    let tx;
    const cfe = (await ethers.getContract("CTokenFirstExtension")) as CTokenFirstExtension;
    {
      const exts = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(erc20Delegate.address);
      if (!exts.length) {
        console.log(`setting the extension for delegate ${erc20Delegate.address}`);
        tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20Delegate.address, [erc20Delegate.address, cfe.address]);
        console.log(`tx ${tx.hash}`);
        await tx.wait();
        console.log(`mined ${tx.hash}`);
      } else {
        console.log(`extensions for delegate ${erc20Delegate.address} already configured`);
      }
    }

    {
      const exts = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(erc20PluginDelegate.address);
      if (!exts.length) {
        console.log(`setting the extension for plugin delegate ${erc20PluginDelegate.address}`);
        tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20PluginDelegate.address, [erc20PluginDelegate.address, cfe.address]);
        console.log(`tx ${tx.hash}`);
        await tx.wait();
        console.log(`mined ${tx.hash}`);
      } else {
        console.log(`extensions for plugin delegate ${erc20PluginDelegate.address} already configured`);
      }
    }

    {
      const exts = await fuseFeeDistributor.callStatic.getCErc20DelegateExtensions(erc20PluginRewardsDelegate.address);
      if (!exts.length) {
        console.log(`setting the extension for plugin rewards delegate ${erc20PluginRewardsDelegate.address}`);
        tx = await fuseFeeDistributor._setCErc20DelegateExtensions(erc20PluginRewardsDelegate.address, [erc20PluginRewardsDelegate.address, cfe.address]);
        console.log(`tx ${tx.hash}`);
        await tx.wait();
        console.log(`mined ${tx.hash}`);
      } else {
        console.log(`extensions for plugin rewards delegate ${erc20PluginRewardsDelegate.address} already configured`);
      }
    }

    const becomeImplementationData = new ethers.utils.AbiCoder().encode(["address"], [constants.AddressZero]);
    const [latestCErc20Delegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(1);
    if (latestCErc20Delegate === constants.AddressZero || latestCErc20Delegate !== erc20Delegate.address) {
      tx = await fuseFeeDistributor._setLatestCErc20Delegate(
        1,
        erc20Delegate.address,
        "0x00"
      );
      console.log("_setLatestCErc20Delegate:", tx.hash);
      await tx.wait();
    } else {
      console.log(`latest impl for delegate ${erc20Delegate.address} already configured`);
    }

    // CErc20PluginDelegate
    const [latestCErc20PluginDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(
      2
    );
    if (
      latestCErc20PluginDelegate === constants.AddressZero ||
      latestCErc20PluginDelegate !== erc20PluginDelegate.address
    ) {
      tx = await fuseFeeDistributor._setLatestCErc20Delegate(
        2,
        erc20PluginDelegate.address,
        becomeImplementationData
      );
      console.log("_setLatestCErc20Delegate (plugin):", tx.hash);
      await tx.wait();
    } else {
      console.log(`latest impl for plugin delegate ${erc20PluginDelegate.address} already configured`);
    }

    const [latestCErc20PluginRewardsDelegate] = await fuseFeeDistributor.callStatic.latestCErc20Delegate(
      4
    );
    if (
      latestCErc20PluginRewardsDelegate === constants.AddressZero ||
      latestCErc20PluginRewardsDelegate !== erc20PluginRewardsDelegate.address
    ) {
      tx = await fuseFeeDistributor._setLatestCErc20Delegate(
        4,
        erc20PluginRewardsDelegate.address,
        becomeImplementationData
      );
      console.log("_setLatestCErc20Delegate (plugin rewards):", tx.hash);
      await tx.wait();
    } else {
      console.log(
        `latest impl for plugin rewards delegate ${erc20PluginRewardsDelegate.address} already configured`
      );
    }
  });
