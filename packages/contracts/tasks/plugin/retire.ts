import { task, types } from "hardhat/config";
import { Address, encodeAbiParameters, Hash, parseAbiParameters, zeroAddress } from "viem";

export default task("plugin:retire", "Retires a plugin from its market")
  .addParam("market", "The address of the market whose plugin to retire", undefined, types.string)
  .setAction(async ({ market }, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    let tx: Hash;

    const simpleDelegate = await viem.getContractAt(
      "CErc20Delegate",
      (await deployments.get("CErc20Delegate")).address as Address
    );

    const pluginMarket = await viem.getContractAt("ICErc20Plugin", market);
    const pluginAddress = await pluginMarket.read.plugin();

    const plugin = await viem.getContractAt("IonicERC4626", pluginAddress);
    tx = await plugin.write.emergencyWithdrawAndPause();
    console.log(`pausing the plugin with tx ${tx}`);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`paused the plugin`);

    tx = await plugin.write.shutdown([market]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`shut down the plugin ${plugin.address} and transferred the assets back to the market ${market} `);

    const implBefore = await pluginMarket.read.implementation();

    const becomeImplementationData = encodeAbiParameters(parseAbiParameters("address"), [zeroAddress]);
    tx = await pluginMarket.write._setImplementationSafe([simpleDelegate.address, becomeImplementationData]);
    console.log(`downgrading with tx ${tx}`);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    const implAfter = await pluginMarket.read.implementation();
    console.log(`downgraded market ${market} from plugin delegate ${implBefore} to simple delegate ${implAfter}`);
  });
