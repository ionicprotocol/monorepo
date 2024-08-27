import { task, types } from "hardhat/config";
import { Address } from "viem";

export default task("market:set-plugin", "Set's the plugin of a market")
  .addParam("comptrollerAddress", "Address of the comptroller of the market", undefined, types.string) // TODO I would rather use id or comptroller address directly.
  .addParam("underlying", "Underlying asset symbol or address", undefined, types.string)
  .addParam("pluginAddress", "The address of the deployed plugin", "", types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { viem, deployments, getNamedAccounts }) => {
    const publicClient = await viem.getPublicClient();
    const { comptrollerAddress, underlying, pluginAddress } = taskArgs;

    const comptroller = await viem.getContractAt("IonicComptroller", comptrollerAddress as Address);

    const allMarkets = await comptroller.read.getAllMarkets();

    const cTokenInstances = await Promise.all(
      allMarkets.map(async (marketAddress) => {
        return await viem.getContractAt("ICErc20Plugin", marketAddress);
      })
    );

    const cTokenInstance = cTokenInstances.find(async (cToken) => {
      return (await cToken.read.underlying()) == underlying;
    });

    console.log(`Setting plugin to ${pluginAddress}`);
    const setPluginTx = await cTokenInstance!.write._updatePlugin(pluginAddress);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: setPluginTx
    });
    if (receipt.status !== "success") {
      throw `Failed set plugin to ${pluginAddress}`;
    }
    console.log(`Plugin successfully set to ${pluginAddress} for market ${cTokenInstance!.address}`);
  });
