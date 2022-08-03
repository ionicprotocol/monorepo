import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { constants } from "ethers";
import { task, types } from "hardhat/config";

export default task("market:upgrade", "Upgrades a market's implementation")
  .addParam("poolName", "Name of pool", undefined, types.string)
  .addParam("market", "Underlying asset symbol or address", undefined, types.string)
  .addOptionalParam("implementationAddress", "The address of the new implementation", "", types.string)
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const { poolName, marketId } = taskArgs;
    let { implementationAddress } = taskArgs;

    const signer = await ethers.getNamedSigner(taskArgs.admin);
    console.log(`signer is ${signer.address}`);

    // @ts-ignoreutils/pool
    const poolModule = await import("../../tests/utils/pool");
    // @ts-ignoreutils/fuseSdk
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const pool = await poolModule.getPoolByName(poolName, sdk);

    const assets = pool.assets;

    const assetConfig = assets.find((a) => a.underlyingToken === marketId || a.underlyingSymbol === marketId);

    const market = pool.assets.find((a) => a.underlyingToken == assetConfig.underlyingToken);
    console.log("market", market);

    const cTokenInstance = sdk.getCTokenInstance(market.cToken);
    if (implementationAddress === "") {
      // reuse the current implementation, only update the plugin
      implementationAddress = await cTokenInstance.callStatic.implementation();
    }
    assetConfig.plugin = sdk.chainPlugins[assetConfig.underlyingToken].find((p) => p.strategyCode === strategyCode);

    // console.log(await cTokenInstance.callStatic.fuseAdmin(), "FUSE ADMIN");

    const pluginAddress = 0x00;
    const abiCoder = new ethers.utils.AbiCoder();
    const implementationData = abiCoder.encode(["address"], [pluginAddress]);

    console.log(`Setting implementation to ${implementationAddress} and plugin to ${pluginAddress}`);
    const setImplementationTx = await cTokenInstance._setImplementationSafe(
      implementationAddress,
      false,
      implementationData
    );

    const receipt: TransactionReceipt = await setImplementationTx.wait();
    if (receipt.status != constants.One.toNumber()) {
      throw `Failed set implementation to ${implementationAddress}`;
    }
    console.log(`Implementation successfully set to ${implementationAddress}`);
  });
