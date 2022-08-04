import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

export default task("market:upgrade", "Upgrades a market's implementation")
  .addParam("poolName", "Name of pool", undefined, types.string) // TODO I would rather use id or comptroller address directly.
  .addParam("underlying", "Underlying asset symbol or address", undefined, types.string)
  .addParam("implementationAddress", "The address of the new implementation", "", types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const { poolName, underlying, signer: namedSigner } = taskArgs;
    let { implementationAddress } = taskArgs;

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

    const cTokenInstance = sdk.getCTokenInstance(market.cToken);
    if (implementationAddress === "") {
      // reuse the current implementation, only update the plugin
      implementationAddress = await cTokenInstance.callStatic.implementation();
    }

    // TODO Using Zero Address here as this task should not set a plugin on the new implementaiton
    const pluginAddress = ethers.constants.AddressZero;
    const abiCoder = new ethers.utils.AbiCoder();
    const implementationData = abiCoder.encode(["address"], [pluginAddress]);

    console.log(`Setting implementation to ${implementationAddress}`);
    const setImplementationTx = await cTokenInstance._setImplementationSafe(
      implementationAddress,
      false,
      implementationData
    );

    const receipt: TransactionReceipt = await setImplementationTx.wait();
    if (receipt.status != ethers.constants.One.toNumber()) {
      throw `Failed set implementation to ${implementationAddress}`;
    }
    console.log(`Implementation successfully set to ${implementationAddress}`);
  });
