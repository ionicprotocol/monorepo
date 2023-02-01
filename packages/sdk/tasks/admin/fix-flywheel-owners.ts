import { providers } from "ethers";
import { task, types } from "hardhat/config";

import { MidasFlywheelCore } from "../../typechain/MidasFlywheelCore";

task("deploy-fwr", "Changes the system admin to a new address")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("flywheel", "The address of the new deployer", undefined, types.string)
  .addParam("name", "Name of the FW rewarsd", undefined, types.string)
  .setAction(async ({ signer, flywheel, name }, { ethers, deployments }) => {
    const deployer = await ethers.getNamedSigner(signer);

    console.log("current deployer", deployer.address);
    console.log("flywheel", flywheel);
    console.log("name", name);
    const rewards = await deployments.deploy(`FlywheelStaticRewards_${name}`, {
      contract: "FlywheelStaticRewards",
      from: deployer.address,
      log: true,
      args: [
        flywheel, // flywheel
        deployer.address, // owner
        ethers.constants.AddressZero, // Authority
      ],
      waitConfirmations: 1,
    });
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(deployer);

    const tx = await sdk.setFlywheelRewards(flywheel, rewards.address);
    await tx.wait();
  });

export default task("replace-fee-recipient", "Changes the system admin to a new address")
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .addParam("fwAddresses", "The addresses of the fw for which to update the fees", undefined, types.string)
  .setAction(async ({ newDeployer, fwAddresses }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const deployer = await ethers.getSigner(newDeployer);
    console.log("current deployer", deployer.address);

    const flywheelAddresses = fwAddresses.split(",");
    for (const flywheelAddress of flywheelAddresses) {
      const flywheelCore = (await ethers.getContractAt(
        "MidasFlywheelCore",
        flywheelAddress,
        deployer
      )) as MidasFlywheelCore;

      const currentOwner = await flywheelCore.callStatic.owner();
      console.log(`current owner ${currentOwner} of the flywheel at ${flywheelCore.address}`);
      console.log("flywheel rewards address: ", await flywheelCore.callStatic.flywheelRewards());
      const feeRecipient = await flywheelCore.callStatic.feeRecipient();
      const performanceFee = await flywheelCore.callStatic.performanceFee();
      if (feeRecipient === newDeployer) {
        console.log("fee recipient already set to the new deployer");
        continue;
      } else {
        tx = await flywheelCore.updateFeeSettings(performanceFee, newDeployer);
        await tx.wait();
        console.log("fee recipient updated to the new deployer");
      }
    }
  });
