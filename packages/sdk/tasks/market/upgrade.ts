import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";
import { CErc20PluginDelegate } from "../../typechain";

export default task("market:upgrade", "Upgrades a market's implementation")
  .addParam("comptroller", "address of comptroller", undefined, types.string) // TODO I would rather use id or comptroller address directly.
  .addParam("underlying", "Underlying asset symbol or address", undefined, types.string)
  .addParam("implementationAddress", "The address of the new implementation", "", types.string)
  .addOptionalParam("pluginAddress", "The address of plugin which is supposed to used", "", types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const { implementationAddress, comptroller: comptrollerAddress, underlying, signer: namedSigner } = taskArgs;
    let { pluginAddress } = taskArgs;

    const signer = await ethers.getNamedSigner(namedSigner);
    console.log(`signer is ${signer.address}`);

    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(signer);

    const comptroller = sdk.createComptroller(comptrollerAddress, signer);

    const allMarkets = await comptroller.callStatic.getAllMarkets();

    const cTokenInstances = allMarkets.map((marketAddress) =>
      sdk.createCErc20PluginRewardsDelegate(marketAddress, signer)
    );

    let cTokenInstance = undefined;

    for (let index = 0; index < cTokenInstances.length; index++) {
      const thisUnderlying = await cTokenInstances[index].callStatic.underlying();
      console.log({
        underlying: thisUnderlying,
        market: cTokenInstances[index].address,
      });
      if (!cTokenInstance && thisUnderlying === underlying) {
        cTokenInstance = cTokenInstances[index];
      }
    }
    if (!cTokenInstance) {
      throw Error(`No market corresponds to this underlying: ${underlying}`);
    }

    if (!pluginAddress) {
      pluginAddress = ethers.constants.AddressZero;
    }

    const abiCoder = new ethers.utils.AbiCoder();
    const implementationData = abiCoder.encode(["address"], [pluginAddress]);

    console.log(`Setting implementation to ${implementationAddress} with plugin ${pluginAddress}`);
    const setImplementationTx = await cTokenInstance._setImplementationSafe(
      implementationAddress,
      false,
      implementationData
    );

    const receipt: TransactionReceipt = await setImplementationTx.wait();
    if (receipt.status != ethers.constants.One.toNumber()) {
      throw `Failed set implementation to ${implementationAddress}`;
    }
    console.log(
      `Implementation successfully set to ${implementationAddress} with plugin ${await cTokenInstance.callStatic.plugin()}`
    );
  });

task("market:upgrade:safe", "Upgrades a market's implementation")
  .addParam("marketAddress", "market", undefined, types.string)
  .addParam("implementationAddress", "The address of the new implementation", "", types.string)
  .addOptionalParam("pluginAddress", "The address of plugin which is supposed to used", "", types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const { implementationAddress, marketAddress, signer: namedSigner } = taskArgs;
    let { pluginAddress } = taskArgs;

    const signer = await ethers.getNamedSigner(namedSigner);
    console.log(`signer is ${signer.address}`);

    const cTokenInstance = (await ethers.getContractAt(
      "CErc20PluginDelegate",
      marketAddress,
      signer
    )) as CErc20PluginDelegate;

    const impl = await cTokenInstance.callStatic.implementation();
    if (impl.toLowerCase() != implementationAddress.toLowerCase()) {
      if (!pluginAddress) {
        pluginAddress = ethers.constants.AddressZero;
      }

      const abiCoder = new ethers.utils.AbiCoder();
      const implementationData = abiCoder.encode(["address"], [pluginAddress]);

      console.log(`Setting implementation to ${implementationAddress} with plugin ${pluginAddress}`);
      const setImplementationTx = await cTokenInstance._setImplementationSafe(
        implementationAddress,
        false,
        implementationData
      );

      const receipt: TransactionReceipt = await setImplementationTx.wait();
      if (receipt.status != ethers.constants.One.toNumber()) {
        throw `Failed set implementation to ${implementationAddress}`;
      }
      console.log(
        `Implementation successfully set to ${implementationAddress} with plugin ${await cTokenInstance.callStatic.plugin()}`
      );
    } else {
      console.log(`market ${marketAddress} already at ${implementationAddress}`);
    }
  });
