import { TransactionReceipt } from "@ethersproject/providers";
import { task, types } from "hardhat/config";

export default task("market:set-plugin", "Set's the plugin of a market")
  .addParam("comptrollerAddress", "Address of the comptroller of the market", undefined, types.string) // TODO I would rather use id or comptroller address directly.
  .addParam("underlying", "Underlying asset symbol or address", undefined, types.string)
  .addParam("pluginAddress", "The address of the deployed plugin", "", types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const { comptrollerAddress, underlying, pluginAddress, signer: namedSigner } = taskArgs;

    const signer = await ethers.getNamedSigner(namedSigner);
    console.log(`signer is ${signer.address}`);

    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const comptroller = sdk.createComptroller(comptrollerAddress, signer);

    const allMarkets = await comptroller.callStatic.getAllMarkets();

    const cTokenInstances = allMarkets.map((marketAddress) => sdk.createCErc20PluginRewardsDelegate(marketAddress));

    let cTokenInstance = undefined;

    for (let index = 0; index < cTokenInstances.length; index++) {
      const thisUnderlying = await cTokenInstances[index].callStatic.underlying();
      if (!cTokenInstance && thisUnderlying === underlying) {
        cTokenInstance = cTokenInstances[index];
      }
    }

    console.log(`Setting plugin to ${pluginAddress}`);
    const setPluginTx = await cTokenInstance._updatePlugin(pluginAddress);

    const receipt: TransactionReceipt = await setPluginTx.wait();
    if (receipt.status != ethers.constants.One.toNumber()) {
      throw `Failed set plugin to ${pluginAddress}`;
    }
    console.log(`Plugin successfully set to ${pluginAddress} for market ${cTokenInstance.address}`);
  });
