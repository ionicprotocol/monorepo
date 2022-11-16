import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { Comptroller } from "../../lib/contracts/typechain/Comptroller";
import { MidasFlywheelCore } from "../../lib/contracts/typechain/MidasFlywheelCore";

task("loopless-booster", "deploy and a loopless booster for a flywheel")
  .addParam("flywheelAddress", "Address of the flywheel to set the booster to", undefined, types.string)
  .setAction(async ({ flywheelAddress }, { ethers, deployments }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    if (flywheelAddress == "0x34f28ca9B62Af94Ae2F80a9fA2AffEF4D08cB18e") {
        const flywheel = (await ethers.getContractAt("MidasFlywheelCore", flywheelAddress, deployer)) as MidasFlywheelCore;
        const currentBoosterAddress = await flywheel.callStatic.flywheelBooster();

        if (currentBoosterAddress == constants.AddressZero) {
        const booster = await deployments.deploy("LooplessFlywheelBooster", {
          from: deployer.address,
          log: true,
          args: [],
        });

        const tx = await flywheel.setBooster(booster.address);
        await tx.wait();
        console.log(`set the booster with tx ${tx.hash}`);
      } else {
        throw new Error(`flywheel at ${flywheelAddress} already has a booster ${currentBoosterAddress}`);
      }
    }
  });
