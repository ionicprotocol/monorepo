import { constants, Contract } from "ethers";
import { task, types } from "hardhat/config";

import { CErc20PluginDelegate } from "../lib/contracts/typechain/CErc20PluginDelegate";
import { MidasERC4626 } from "../lib/contracts/typechain/MidasERC4626";

task("market:downgrade", "Downgrades a plugin market to a simple market")
  .addParam("market", "The address of the market to downgrade", undefined, types.string)
  .setAction(async ({ market }, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");

    const cTokenInstance = (await ethers.getContractAt("CErc20PluginDelegate", market)) as CErc20PluginDelegate;
    const pluginAddress = await cTokenInstance.callStatic.plugin();
    const erc20Delegate = await ethers.getContract("CErc20Delegate");

    if (market == "0x30b32BbfcA3A81922F88809F53E625b5EE5286f6") {
      // first upgrade the market to the latest delegate
      // then zero the plugin - it will transfer the tokens to the market
      const tx = await cTokenInstance._updatePlugin(constants.AddressZero);
      await tx.wait();
      console.log(`zeroed plugin ${tx.hash}`);
    } else if (market == "0x7AB807F3FBeca9eb22a1A7a490bdC353D85DED41") {
      // first downgrade the market
      let tx = await cTokenInstance._setImplementationSafe(erc20Delegate.address, false, "");
      await tx.wait();
      console.log(`downgraded the market ${tx.hash}`);

      // then transfer the funds from the plugin to the market
      const plugin = (await ethers.getContractAt("MidasERC4626", pluginAddress, signer)) as MidasERC4626;
      tx = await plugin.emergencyWithdrawAndPause();
      await tx.wait();
      console.log(`emergency withdraw and pause ${tx.hash}`);

      tx = await plugin.shutdown(market);
      await tx.wait();
      console.log(`shutdown and transfer to market ${tx.hash}`);
    }
  });
