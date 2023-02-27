import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { CErc20PluginDelegate } from "../../typechain/CErc20PluginDelegate";
import { FuseFeeDistributor } from "../../typechain/FuseFeeDistributor";
import { MidasERC4626 } from "../../typechain/MidasERC4626";

export default task("plugin:retire", "Retires a plugin from its market")
  .addParam("market", "The address of the market whose plugin to retire", undefined, types.string)
  .setAction(async ({ market }, { ethers }) => {
    let tx;
    const deployer = await ethers.getNamedSigner("deployer");

    const pluginDelegate = await ethers.getContract("CErc20PluginDelegate");
    const simpleDelegate = await ethers.getContract("CErc20Delegate");

    const ffd = (await ethers.getContract("FuseFeeDistributor")) as FuseFeeDistributor;

    const downgradeWhitelisted = await ffd.callStatic.cErc20DelegateWhitelist(
      pluginDelegate.address,
      simpleDelegate.address,
      false
    );
    if (!downgradeWhitelisted) {
      tx = await ffd._editCErc20DelegateWhitelist([pluginDelegate.address], [simpleDelegate.address], [false], [true]);
      console.log(`whitelisting the downgrade with tx ${tx.hash}`);
      await tx.wait();
      console.log(`whitelisted`);
    }

    const pluginMarket = (await ethers.getContractAt("CErc20PluginDelegate", market)) as CErc20PluginDelegate;
    const pluginAddress = await pluginMarket.callStatic.plugin();

    const plugin = (await ethers.getContractAt("MidasERC4626", pluginAddress, deployer)) as MidasERC4626;
    tx = await plugin.emergencyWithdrawAndPause();
    console.log(`pausing the plugin with tx ${tx.hash}`);
    await tx.wait();
    console.log(`paused the plugin`);

    tx = await plugin.shutdown(market);
    await tx.wait();
    console.log(`shut down the plugin ${plugin.address} and transferred the assets back to the market ${market} `);

    const implBefore = await pluginMarket.callStatic.implementation();

    const becomeImplementationData = new ethers.utils.AbiCoder().encode(["address"], [constants.AddressZero]);
    tx = await pluginMarket._setImplementationSafe(simpleDelegate.address, false, becomeImplementationData);
    console.log(`downgrading with tx ${tx.hash}`);
    await tx.wait();

    const implAfter = await pluginMarket.callStatic.implementation();
    console.log(`downgraded market ${market} from plugin delegate ${implBefore} to simple delegate ${implAfter}`);
  });

task("plugins:beefy:retire", "Retires the Beefy plugin that are marked as EOL").setAction(
  async ({}, { run, getChainId }) => {
    const chainid = parseInt(await getChainId());

    const markets = [];
    if (chainid == 56) {
      //bsc
      markets.push("0xBEE206C085f228674a2273F8A33ceaD9e34c3d48"); // ellipsis-valdai3eps
      markets.push("0x906Ab4476221ADc91Dc112c25081A374E0bd29C0"); // cakev2-wbnb-stkbnb
    } else if (chainid == 137) {
      // polygon
      markets.push("0x41EDdba1e19fe301A067b2726DF5a3332DD02D6A"); // jarvis-2sgd
      markets.push("0xCC7eab2605972128752396241e46C281e0405a27"); // jarvis jfiat 2eur - jarvis-2eurp
      markets.push("0x30b32BbfcA3A81922F88809F53E625b5EE5286f6"); // mimo jeur-par - jarvis-2eurp
      markets.push("0x9b5D86F4e7A45f4b458A2B673B4A3b43D15428A7"); // jarvis-2eur
      markets.push("0x1792046890b99ae36756Fd00f135dc5F80D41dfA"); // jarvis-2jpy2
    }

    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      await run("retire:plugin", {
        market,
      });
    }
  }
);
