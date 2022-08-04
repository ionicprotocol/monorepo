import { TransactionReceipt } from "@ethersproject/providers";
import { task, types } from "hardhat/config";

export default task("market:set-plugin", "Set's the plugin of a market")
  .addParam("poolName", "Name of pool", undefined, types.string) // TODO I would rather use id or comptroller address directly.
  .addParam("underlying", "Underlying asset symbol or address", undefined, types.string)
  .addParam("pluginAddress", "The address of the deployed plugin", "", types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const { poolName, underlying, pluginAddress, signer: namedSigner } = taskArgs;

    const signer = await ethers.getNamedSigner(namedSigner);
    console.log(`signer is ${signer.address}`);

    // @ts-ignore
    const poolModule = await import("../../tests/utils/pool");
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const pool = await poolModule.getPoolByName(poolName, sdk);

    const assets = pool.assets;

    const assetConfig = assets.find((a) => a.underlyingToken === underlying || a.underlyingSymbol === underlying);

    const market = pool.assets.find((a) => a.underlyingToken == assetConfig.underlyingToken);
    console.log("market", market);

    const cTokenInstance = sdk.getCErc20PluginInstance(market.cToken);

    console.log(`Setting plugin to ${pluginAddress}`);
    const setPluginTx = await cTokenInstance._updatePlugin(pluginAddress);

    const receipt: TransactionReceipt = await setPluginTx.wait();
    if (receipt.status != ethers.constants.One.toNumber()) {
      throw `Failed set plugin to ${pluginAddress}`;
    }
    console.log(`Plugin successfully set to ${pluginAddress} for market ${market.cToken}`);
  });
