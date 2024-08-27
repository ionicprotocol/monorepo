import { task, types } from "hardhat/config";
import { Address } from "viem";

export default task("ionicfee:update", "Update IonicFee")
  .addParam("signer", "Named account to use for the tx", "deployer", types.string)
  .addParam("cToken", "Asset cToken Address", undefined, types.string)
  .addParam("adminFee", "AdminFee", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const adminFee = taskArgs.adminFee;
    const cToken = await hre.viem.getContractAt("ICErc20", taskArgs.cToken as Address);
    await cToken.write._setAdminFee([adminFee]);
  });

task("liquidation:fees:update", "Update the liquidation fees (parts of the total penalty)")
  .addParam("caller", "Named account to use for the tx", "deployer", types.string)
  .addParam("market", "Asset cToken Address", undefined, types.string)
  .addParam("liquidatorIncentive", "Liquidator incentive, measured in bps, 100% + x%", undefined, types.string)
  .addParam("protocolSeizeShare", "Protocol seize share, measured in bps, x%", undefined, types.string)
  .addParam("marketSeizeShare", "Market seize share, measured in bps, x%", undefined, types.string)
  .setAction(async ({ market, caller, liquidatorIncentive, protocolSeizeShare, marketSeizeShare }, { viem }) => {
    const publicClient = await viem.getPublicClient();
    const cTokenInstance = await viem.getContractAt("CErc20Delegate", market as Address);

    const poolAddress = await cTokenInstance.read.comptroller();
    const pool = await viem.getContractAt("Comptroller", poolAddress);

    // measured in bps, 100% + x%
    const liquidatorIncentiveCurrent = await pool.read.liquidationIncentiveMantissa();
    if (liquidatorIncentiveCurrent !== BigInt(liquidatorIncentive)) {
      const tx = await pool.write._setLiquidationIncentive(liquidatorIncentive);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`set the liquidation incentive for pool ${poolAddress}`);
    }

    // TODO implement setters once the CToken is using the diamond pattern
    // in bps
    const protocolSeizeShareCurrent = await cTokenInstance.read.protocolSeizeShareMantissa();
    if (protocolSeizeShareCurrent != protocolSeizeShare) {
      // const tx = await cTokenInstance.TODO(protocolSeizeShare);
      // await tx.wait();
      // console.log(`set the protocol seize share for market ${market}`);
    }

    // in bps
    const marketSeizeShareCurrent = await cTokenInstance.read.feeSeizeShareMantissa();
    if (marketSeizeShareCurrent != marketSeizeShare) {
      // const tx = await cTokenInstance.TODO(marketSeizeShare);
      // await tx.wait();
      // console.log(`set the market seize share for market ${market}`);
    }
  });
