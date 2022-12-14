import { Contract } from "ethers";
import { task, types } from "hardhat/config";

import { CErc20Delegate } from "../../lib/contracts/typechain/CErc20Delegate";
import { Comptroller } from "../../lib/contracts/typechain/Comptroller";

export default task("fusefee:update", "Update FuseFee")
  .addParam("signer", "Named account to use for the tx", "deployer", types.string)
  .addParam("cToken", "Asset cToken Address", undefined, types.string)
  .addParam("adminFee", "AdminFee", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const adminFee = taskArgs.adminFee;

    const signer = await hre.ethers.getNamedSigner(taskArgs.signer);

    // @ts-ignoreutils/fuseSdk
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const cToken = new Contract(taskArgs.cToken, sdk.chainDeployment.CTokenFirstExtension.abi, signer);

    await cToken._setAdminFee(adminFee);
  });

task("liquidation:fees:update", "Update the liquidation fees (parts of the total penalty)")
  .addParam("caller", "Named account to use for the tx", "deployer", types.string)
  .addParam("market", "Asset cToken Address", undefined, types.string)
  .addParam("liquidatorIncentive", "Liquidator incentive, measured in bps, 100% + x%", undefined, types.string)
  .addParam("protocolSeizeShare", "Protocol seize share, measured in bps, x%", undefined, types.string)
  .addParam("marketSeizeShare", "Market seize share, measured in bps, x%", undefined, types.string)
  .setAction(async ({ market, caller, liquidatorIncentive, protocolSeizeShare, marketSeizeShare }, { ethers }) => {
    const signer = await ethers.getNamedSigner(caller);
    const cTokenInstance = (await ethers.getContractAt("CErc20Delegate", market, signer)) as CErc20Delegate;

    const poolAddress = await cTokenInstance.callStatic.comptroller();
    const pool = (await ethers.getContractAt("Comptroller", poolAddress, signer)) as Comptroller;

    // measured in bps, 100% + x%
    const liquidatorIncentiveCurrent = await pool.callStatic.liquidationIncentiveMantissa();
    if (liquidatorIncentiveCurrent != liquidatorIncentive) {
      const tx = await pool._setLiquidationIncentive(liquidatorIncentive);
      await tx.wait();
      console.log(`set the liquidation incentive for pool ${poolAddress}`);
    }

    // TODO implement setters once the CToken is using the diamond pattern
    // in bps
    const protocolSeizeShareCurrent = await cTokenInstance.callStatic.protocolSeizeShareMantissa();
    if (protocolSeizeShareCurrent != protocolSeizeShare) {
      // const tx = await cTokenInstance.TODO(protocolSeizeShare);
      // await tx.wait();
      // console.log(`set the protocol seize share for market ${market}`);
    }

    // in bps
    const marketSeizeShareCurrent = await cTokenInstance.callStatic.feeSeizeShareMantissa();
    if (marketSeizeShareCurrent != marketSeizeShare) {
      // const tx = await cTokenInstance.TODO(marketSeizeShare);
      // await tx.wait();
      // console.log(`set the market seize share for market ${market}`);
    }
  });
