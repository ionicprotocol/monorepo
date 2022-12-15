import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../lib/contracts/typechain/ComptrollerFirstExtension";
import { FlywheelStaticRewards } from "../../lib/contracts/typechain/FlywheelStaticRewards";
import { MidasFlywheelCore } from "../../lib/contracts/typechain/MidasFlywheelCore";

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
      )) as MidasFlywheelCore;
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
        const tx = await flywheel.setBooster(booster.address);
        await tx.wait();
        console.log(`set the booster at ${booster.address} to flywheel at ${flywheelAddress} with tx ${tx.hash}`);
      } else {
        throw new Error(`flywheel at ${flywheelAddress} already has a booster ${currentBoosterAddress}`);
      }
    }
  });

task("replace-flywheel-with-upgradable", "").setAction(async ({}, { ethers, deployments, getChainId }) => {
  const poolAddress = "0xeB2D3A9D962d89b4A9a34ce2bF6a2650c938e185"; // stDOT Pool
  const brokenFlywheelAddress = "0xbCeB5Cb9b7Ea70994d8a7cfAC5D48dEA849CED06";
  const fxcDOTMarketAddress = "0xa9736bA05de1213145F688e4619E5A7e0dcf4C72";
  //const fwstDOTMarketAddress = "0xb3D83F2CAb787adcB99d4c768f1Eb42c8734b563";

  const deployer = await ethers.getNamedSigner("deployer");
  const chainid = await getChainId();
  if (chainid == "1284") {
    const asComptrollerExtension = (await ethers.getContractAt(
      "ComptrollerFirstExtension",
      poolAddress,
      deployer
    )) as ComptrollerFirstExtension;

    const asComptroller = (await ethers.getContractAt("Comptroller", poolAddress, deployer)) as Comptroller;

    const brokenFlywheel = (await ethers.getContractAt(
      "MidasFlywheelCore",
      brokenFlywheelAddress,
      deployer
    )) as MidasFlywheelCore;

    const rewardToken = await brokenFlywheel.callStatic.rewardToken();
    const flywheelBooster = await brokenFlywheel.callStatic.flywheelBooster();
    const oldStaticRewardsAddress = await brokenFlywheel.callStatic.flywheelRewards();

    const oldStaticRewards = (await ethers.getContractAt(
      "FlywheelStaticRewards",
      oldStaticRewardsAddress,
      deployer
    )) as FlywheelStaticRewards;

    let tx = await oldStaticRewards.setRewardsInfo(fxcDOTMarketAddress, {
      rewardsPerSecond: 0,
      rewardsEndTimestamp: 1,
    });
    await tx.wait();
    console.log("setRewardsInfo: ", tx.hash);

    // tx = await oldStaticRewards.setRewardsInfo(fwstDOTMarketAddress, {
    //   rewardsPerSecond: 0,
    //   rewardsEndTimestamp: 1,
    // });
    // await tx.wait();
    // console.log("setRewardsInfo: ", tx.hash);

    const replacingFlywheel = await deployments.deploy("MidasFlywheel", {
      contract: "MidasFlywheel",
      from: deployer.address,
      log: true,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "initialize",
            args: [rewardToken, constants.AddressZero, flywheelBooster, deployer.address],
          },
        },
        owner: deployer.address,
      },
      waitConfirmations: 1,
    });

    // the replacing rewards contract is needed because on creation it makes an infinite approve to the flywheel
    const replacingRewards = await deployments.deploy("FlywheelStaticRewards", {
      contract: "FlywheelStaticRewards",
      from: deployer.address,
      log: true,
      args: [
        replacingFlywheel.address, // flywheel
        deployer.address, // owner
        constants.AddressZero, // Authority
      ],
      waitConfirmations: 1,
    });

    // this will transfer all the rewards from the old FlywheelStaticRewards contract
    // which has an infinite approve only to the old flywheel
    tx = await brokenFlywheel.setFlywheelRewards(replacingRewards.address);
    await tx.wait();
    console.log("setFlywheelRewards: ", tx.hash);

    // probably it is better to remove the flywheel because it cannot pull rewards from the new FlywheelStaticRewards
    // so whatever rewards were accrued, will be reset and cannot be claimed
    tx = await asComptrollerExtension.addNonAccruingFlywheel(brokenFlywheelAddress);
    await tx.wait();
    console.log("addNonAccruingFlywheel: ", tx.hash);

    // adding the new flywheel to the pool
    tx = await asComptroller._addRewardsDistributor(replacingFlywheel.address);
    await tx.wait();
    console.log("_addRewardsDistributor: ", tx.hash);

    // configuring the same two strategies/markets
    const newFlywheel = (await ethers.getContractAt(
      "MidasFlywheelCore",
      replacingFlywheel.address,
      deployer
    )) as MidasFlywheelCore;

    // the flywheel was initialized with address(0) for the rewards, so set it up
    tx = await newFlywheel.setFlywheelRewards(replacingRewards.address);
    await tx.wait();
    console.log("setFlywheelRewards: ", tx.hash);

    tx = await newFlywheel.addStrategyForRewards(fxcDOTMarketAddress);
    await tx.wait();
    console.log("addStrategyForRewards fxcDOT: ", tx.hash);

    // tx = await newFlywheel.addStrategyForRewards(fwstDOTMarketAddress);
    // await tx.wait();
    // console.log("addStrategyForRewards fwstDOT: ", tx.hash);
  } else {
    console.log(`wrong chain`);
  }
});

task("remove-flywheel", "remove a rewards distributor from a pool")
.setAction(async ({ /*flywheelAddress, poolAddress*/ }, { ethers, getChainId }) => {
  const poolAddress = "0xeB2D3A9D962d89b4A9a34ce2bF6a2650c938e185"; // stDOT Pool
  const brokenFlywheel1Address = "0xbCeB5Cb9b7Ea70994d8a7cfAC5D48dEA849CED06";
  const brokenFlywheel2Address = "0x0e7742b50a14Cbc879193f6b2E04EfcDCCC6BE86";

  const deployer = await ethers.getNamedSigner("deployer");
  const chainid = await getChainId();

  if (chainid == "1284") {
    const asComptrollerExtension = (await ethers.getContractAt(
      "ComptrollerFirstExtension",
      poolAddress,
      deployer
    )) as ComptrollerFirstExtension;

    let tx = await asComptrollerExtension._removeFlywheel(brokenFlywheel1Address);
    await tx.wait();
    console.log("_removeFlywheel: ", tx.hash);

    tx = await asComptrollerExtension._removeFlywheel(brokenFlywheel2Address);
    await tx.wait();
    console.log("_removeFlywheel: ", tx.hash);
  }
});
