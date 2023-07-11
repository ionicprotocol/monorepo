import { task, types } from "hardhat/config";

import { FlywheelStaticRewards } from "../../typechain/FlywheelStaticRewards";
import { MidasFlywheelCore as IonicFlywheelCore } from "../../typechain/MidasFlywheelCore";

task("loopless-booster", "deploy and a loopless booster for a flywheel")
  .addParam("flywheelAddress", "Address of the flywheel to set the booster to", undefined, types.string)
  .setAction(async ({ flywheelAddress }, { ethers, deployments, getChainId }) => {
    const deployer = await ethers.getNamedSigner("deployer");
    const chainid = await getChainId();
    if (flywheelAddress == "0xUseThisToVerify") {
      const flywheel = (await ethers.getContractAt(
        "MidasFlywheelCore",
        flywheelAddress,
        deployer
      )) as IonicFlywheelCore;
      const currentBoosterAddress = await flywheel.callStatic.flywheelBooster();
      let oldBooster;
      if (chainid == "56") {
        oldBooster = "0xb6A11f567C1A8625c47Bd37318b316F52bE6193F";
      } else if (chainid == "1284") {
        oldBooster = "0x9398Edb4a38a961E31AD619a79deE520c87FDd19";
      }
      if (currentBoosterAddress == oldBooster) {
        const booster = await deployments.deploy("LooplessFlywheelBooster", {
          from: deployer.address,
          log: true,
          args: [],
        });
        if (booster.transactionHash) {
          await ethers.provider.waitForTransaction(booster.transactionHash);
        }
        console.log("LooplessFlywheelBooster: ", booster.address);
        const tx = await flywheel.setBooster(booster.address);
        await tx.wait();
        console.log(`set the booster at ${booster.address} to flywheel at ${flywheelAddress} with tx ${tx.hash}`);
      } else {
        throw new Error(`flywheel at ${flywheelAddress} already has a booster ${currentBoosterAddress}`);
      }
    }
  });

task("configure-static-rewards-chapel", "").setAction(async ({}, { ethers, deployments, getChainId }) => {
  const deployer = await ethers.getNamedSigner("deployer");
  const staticRewardsAddress = "0xF7a040Af0a2bd81Da65cC7692DCa3af23E64D982";
  const bombMarket = "0xfa60851E76728eb31EFeA660937cD535C887fDbD";

  const staticRewards = (await ethers.getContractAt(
    "FlywheelStaticRewards",
    staticRewardsAddress,
    deployer
  )) as FlywheelStaticRewards;

  const tx = await staticRewards.setRewardsInfo(bombMarket, {
    rewardsPerSecond: 1000000000,
    rewardsEndTimestamp: 1751784923,
  });
  await tx.wait();
  console.log("setRewardsInfo: ", tx.hash);
});
