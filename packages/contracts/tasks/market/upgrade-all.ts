import { task } from "hardhat/config";
import { Address, encodeAbiParameters, parseAbiParameters, zeroAddress } from "viem";

task("market:set-latest", "Updates the markets' implementations whitelist").setAction(
  async (taskArgs, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    const fuseFeeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );
    const erc20Delegate = await viem.getContractAt(
      "CErc20Delegate",
      (await deployments.get("CErc20Delegate")).address as Address
    );
    const erc20PluginDelegate = await viem.getContractAt(
      "CErc20PluginDelegate",
      (await deployments.get("CErc20PluginDelegate")).address as Address
    );
    const erc20PluginRewardsDelegate = await viem.getContractAt(
      "CErc20PluginRewardsDelegate",
      (await deployments.get("CErc20PluginRewardsDelegate")).address as Address
    );

    let tx;
    const cfe = await viem.getContractAt(
      "CTokenFirstExtension",
      (await deployments.get("CTokenFirstExtension")).address as Address
    );
    {
      const exts = await fuseFeeDistributor.read.getCErc20DelegateExtensions([erc20Delegate.address]);
      if (exts.length == 0 || exts[0] != cfe.address) {
        console.log(`setting the extension for delegate ${erc20Delegate.address}`);
        tx = await fuseFeeDistributor.write._setCErc20DelegateExtensions([
          erc20Delegate.address,
          [erc20Delegate.address, cfe.address]
        ]);
        console.log(`tx ${tx}`);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`mined ${tx}`);
      } else {
        console.log(`extensions for delegate ${erc20Delegate.address} already configured`);
      }
    }

    {
      const exts = await fuseFeeDistributor.read.getCErc20DelegateExtensions([erc20PluginDelegate.address]);
      if (exts.length == 0 || exts[0] != cfe.address) {
        console.log(`setting the extension for plugin delegate ${erc20PluginDelegate.address}`);
        tx = await fuseFeeDistributor.write._setCErc20DelegateExtensions([
          erc20PluginDelegate.address,
          [erc20PluginDelegate.address, cfe.address]
        ]);
        console.log(`tx ${tx}`);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`mined ${tx}`);
      } else {
        console.log(`extensions for plugin delegate ${erc20PluginDelegate.address} already configured`);
      }
    }

    {
      const exts = await fuseFeeDistributor.read.getCErc20DelegateExtensions([erc20PluginRewardsDelegate.address]);
      if (exts.length == 0 || exts[0] != cfe.address) {
        console.log(`setting the extension for plugin rewards delegate ${erc20PluginRewardsDelegate.address}`);
        tx = await fuseFeeDistributor.write._setCErc20DelegateExtensions([
          erc20PluginRewardsDelegate.address,
          [erc20PluginRewardsDelegate.address, cfe.address]
        ]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`mined ${tx}`);
      } else {
        console.log(`extensions for plugin rewards delegate ${erc20PluginRewardsDelegate.address} already configured`);
      }
    }

    const becomeImplementationData = encodeAbiParameters(parseAbiParameters("address"), [zeroAddress]);
    const [latestCErc20Delegate] = await fuseFeeDistributor.read.latestCErc20Delegate([1]);
    if (latestCErc20Delegate === zeroAddress || latestCErc20Delegate !== erc20Delegate.address) {
      tx = await fuseFeeDistributor.write._setLatestCErc20Delegate([1, erc20Delegate.address, "0x00"]);
      console.log("_setLatestCErc20Delegate:", tx);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    } else {
      console.log(`latest impl for delegate ${erc20Delegate.address} already configured`);
    }

    // CErc20PluginDelegate
    const [latestCErc20PluginDelegate] = await fuseFeeDistributor.read.latestCErc20Delegate([2]);
    if (latestCErc20PluginDelegate === zeroAddress || latestCErc20PluginDelegate !== erc20PluginDelegate.address) {
      tx = await fuseFeeDistributor.write._setLatestCErc20Delegate([
        2,
        erc20PluginDelegate.address,
        becomeImplementationData
      ]);
      console.log("_setLatestCErc20Delegate (plugin):", tx);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    } else {
      console.log(`latest impl for plugin delegate ${erc20PluginDelegate.address} already configured`);
    }

    const [latestCErc20PluginRewardsDelegate] = await fuseFeeDistributor.read.latestCErc20Delegate([4]);
    if (
      latestCErc20PluginRewardsDelegate === zeroAddress ||
      latestCErc20PluginRewardsDelegate !== erc20PluginRewardsDelegate.address
    ) {
      tx = await fuseFeeDistributor.write._setLatestCErc20Delegate([
        4,
        erc20PluginRewardsDelegate.address,
        becomeImplementationData
      ]);
      console.log("_setLatestCErc20Delegate (plugin rewards):", tx);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    } else {
      console.log(`latest impl for plugin rewards delegate ${erc20PluginRewardsDelegate.address} already configured`);
    }
  }
);
