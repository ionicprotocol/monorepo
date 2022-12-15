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
