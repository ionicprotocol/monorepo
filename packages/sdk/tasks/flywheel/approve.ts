import { task, types } from "hardhat/config";

import { CErc20PluginRewardsDelegate } from "../../typechain/CErc20PluginRewardsDelegate";
import { JarvisSafeLiquidator } from "../../typechain/JarvisSafeLiquidator";
import { MidasFlywheel } from "../../typechain/MidasFlywheel";

task("approve-market-flywheel")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .addParam("fwAddress", "Flywheel address, one for each reward token", undefined, types.string)
  .addParam("markets", "Marekts", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const deployer = await ethers.getNamedSigner(taskArgs.signer);

    const flywheelAddress = taskArgs.fwAddress;
    const marketAddresses = taskArgs.markets.split(",");

    const flywheel = (await ethers.getContractAt("MidasFlywheel", flywheelAddress, deployer)) as MidasFlywheel;
    for (const marketAddress of marketAddresses) {
      const market = (await ethers.getContractAt(
        "CErc20PluginRewardsDelegate",
        marketAddress,
        deployer
      )) as CErc20PluginRewardsDelegate;
      const fwRewards = await flywheel.callStatic.flywheelRewards();
      const rewardToken = await flywheel.callStatic.rewardToken();
      const tx = await market["approve(address,address)"](rewardToken, fwRewards);
      console.log(`mining tx ${tx.hash}`);
      await tx.wait();
      console.log(`approved flywheel ${flywheelAddress} to pull reward tokens from market ${marketAddress}`);
    }
  });

task("deploy-jsl").setAction(async ({}, { ethers, deployments }) => {
  const deployer = await ethers.getNamedSigner("deployer");

  const jsl = await deployments.deploy("JarvisSafeLiquidator", {
    from: deployer.address,
    log: true,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
      owner: deployer.address,
    },
  });
  if (jsl.transactionHash) await ethers.provider.waitForTransaction(jsl.transactionHash);
});
