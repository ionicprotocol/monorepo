import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { task, types } from "hardhat/config";

export default task("pool:oracle:change", "Upgrades a market's implementation")
  .addParam("comptroller", "address of comptroller", undefined, types.string) // TODO I would rather use id or comptroller address directly.
  .addParam("newOracle", "Underlying asset symbol or address", undefined, types.string)
  .addOptionalParam("signer", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const { newOracle, comptroller: comptrollerAddress, signer: namedSigner } = taskArgs;

    const signer = await ethers.getNamedSigner(namedSigner);
    console.log(`signer is ${signer.address}`);

    const ionicSdkModule = await import("../../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);

    const pool = sdk.createComptroller(comptrollerAddress, signer);
    console.log(`Setting oracle to ${newOracle}, previous was ${await pool.callStatic.oracle()}`);

    const tx = await pool._setPriceOracle(newOracle);
    const receipt: TransactionReceipt = await tx.wait();
    console.log(receipt.transactionHash);
  });
