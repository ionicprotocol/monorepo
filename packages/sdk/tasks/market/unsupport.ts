import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

export default task("market:unsupport", "Unsupport a market")
  .addParam("comptroller", "Comptroller Address", undefined, types.string)
  .addParam("ctoken", "The address of the ctoken to unsupport", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");

    // @ts-ignoreutils/fuseSdk
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    // @ts-ignoreutils/pool

    const sdk = await midasSdkModule.getOrCreateMidas();

    const comptroller = await sdk.getComptrollerInstance(taskArgs.comptroller, signer);
    const tx = await comptroller._unsupportMarket(taskArgs.ctoken);
    const receipt: TransactionReceipt = await tx.wait();
    console.log("Unsupported market with status:", receipt.status);
  });
