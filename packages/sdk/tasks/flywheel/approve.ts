import { task, types } from "hardhat/config";

import { CErc20PluginRewardsInterface } from "../../typechain/CTokenInterfaces.sol/CErc20PluginRewardsInterface";
import { IonicFlywheel } from "../../typechain/IonicFlywheel";

task("approve-market-flywheel")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("fwAddress", "Flywheel address, one for each reward token", undefined, types.string)
  .addParam("markets", "Marekts", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const deployer = await ethers.getNamedSigner(taskArgs.signer);

    const flywheelAddress = taskArgs.fwAddress;
    const marketAddresses = taskArgs.markets.split(",");

    const flywheel = (await ethers.getContractAt("IonicFlywheel", flywheelAddress, deployer)) as IonicFlywheel;
    for (const marketAddress of marketAddresses) {
      const market = (await ethers.getContractAt(
        "CErc20PluginRewardsDelegate",
        marketAddress,
        deployer
      )) as CErc20PluginRewardsInterface;
      const fwRewards = await flywheel.callStatic.flywheelRewards();
      const rewardToken = await flywheel.callStatic.rewardToken();
      const tx = await market["approve(address,address)"](rewardToken, fwRewards);
      console.log(`mining tx ${tx.hash}`);
      await tx.wait();
      console.log(`approved flywheel ${flywheelAddress} to pull reward tokens from market ${marketAddress}`);
    }
  });

task("flywheel:set-fee-recipient")
  .addParam("fwAddress", "Flywheel address, one for each reward token", undefined, types.string)
  .addParam("feeRecipient", "Fee recipient address", undefined, types.string)
  .setAction(async ({ fwAddress, feeRecipient }, { ethers }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const flywheel = (await ethers.getContractAt("IonicFlywheel", fwAddress, deployer)) as IonicFlywheel;
    const currentFee = await flywheel.callStatic.performanceFee();

    console.log(`updating the fee recipient to ${feeRecipient} for flywheel ${fwAddress}`);
    const tx = await flywheel.updateFeeSettings(currentFee, feeRecipient);
    await tx.wait();
    console.log(`mined tx ${tx.hash}`);
  });
