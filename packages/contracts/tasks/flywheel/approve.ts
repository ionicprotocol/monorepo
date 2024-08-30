import { task, types } from "hardhat/config";
import { Address } from "viem";

task("approve-market-flywheel")
  .addParam("fwAddress", "Flywheel address, one for each reward token", undefined, types.string)
  .addParam("markets", "Marekts", undefined, types.string)
  .setAction(async (taskArgs, { viem }) => {
    const publicClient = await viem.getPublicClient();

    const flywheelAddress: Address = taskArgs.fwAddress;
    const marketAddresses: Address[] = taskArgs.markets.split(",");

    const flywheel = await viem.getContractAt("IonicFlywheel", flywheelAddress);
    for (const marketAddress of marketAddresses) {
      const market = await viem.getContractAt("CErc20RewardsDelegate", marketAddress);
      const fwRewards = await flywheel.read.flywheelRewards();
      const rewardToken = await flywheel.read.rewardToken();
      const tx = await market.write.approve([rewardToken, fwRewards]);
      console.log(`mining tx ${tx}`);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`approved flywheel ${flywheelAddress} to pull reward tokens from market ${marketAddress}`);
    }
  });

task("flywheel:set-fee-recipient")
  .addParam("fwAddress", "Flywheel address, one for each reward token", undefined, types.string)
  .addParam("feeRecipient", "Fee recipient address", undefined, types.string)
  .setAction(async ({ fwAddress, feeRecipient }, { viem }) => {
    const publicClient = await viem.getPublicClient();

    const flywheel = await viem.getContractAt("IonicFlywheel", fwAddress as Address);
    const currentFee = await flywheel.read.performanceFee();

    console.log(`updating the fee recipient to ${feeRecipient} for flywheel ${fwAddress}`);
    const tx = await flywheel.write.updateFeeSettings([currentFee, feeRecipient]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`mined tx ${tx}`);
  });