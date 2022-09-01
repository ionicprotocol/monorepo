import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

export default task("market:unsupport", "Unsupport a market")
  .addParam("poolName", "Name of pool", undefined, types.string)
  .addParam("ctoken", "The address of the ctoken to unsupport", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");

    // @ts-ignoreutils/fuseSdk
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    // @ts-ignoreutils/pool
    const poolModule = await import("../../tests/utils/pool");

    const sdk = await midasSdkModule.getOrCreateMidas();
    const pool = await poolModule.getPoolByName(taskArgs.poolName, sdk);

    const comptroller = await sdk.getComptrollerInstance(pool.comptroller, signer);
    const tx = await comptroller._unsupportMarket(taskArgs.ctoken);
    const receipt: TransactionReceipt = await tx.wait();
    console.log("Unsupported market with status:", receipt.status);
  });
