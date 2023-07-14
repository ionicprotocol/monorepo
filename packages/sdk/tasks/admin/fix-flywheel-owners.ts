import { BigNumber, providers } from "ethers";
import { task, types } from "hardhat/config";

import { IonicERC4626 } from "../../typechain/IonicERC4626";
import { IonicFlywheelCore } from "../../typechain/IonicFlywheelCore";

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

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(deployer);

    const tx = await sdk.setFlywheelRewards(flywheel, rewards.address);
    await tx.wait();
  });

task("replace-fw-fee-recipient", "Changes the system admin to a new address")
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .addParam("fwAddresses", "The addresses of the strategies for which to update the fees", undefined, types.string)
  .setAction(async ({ newDeployer, fwAddresses }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const deployer = await ethers.getSigner(newDeployer);
    console.log("current deployer", deployer.address);

    const flywheelAddresses = fwAddresses.split(",");
    for (const flywheelAddress of flywheelAddresses) {
      const flywheelCore = (await ethers.getContractAt(
        "IonicFlywheelCore",
        flywheelAddress,
        deployer
      )) as IonicFlywheelCore;

      const currentOwner = await flywheelCore.callStatic.owner();
      console.log(`current owner ${currentOwner} of the flywheel at ${flywheelCore.address}`);
      const feeRecipient = await flywheelCore.callStatic.feeRecipient();
      const performanceFee = await flywheelCore.callStatic.performanceFee();
      if (feeRecipient === newDeployer) {
        console.log("fee recipient already set to the new deployer");
        continue;
      } else {
        console.log(`fee recipient needs to be replaced from ${feeRecipient} to ${newDeployer}`);
        tx = await flywheelCore.updateFeeSettings(performanceFee, newDeployer);
        await tx.wait();
        console.log("fee recipient updated to the new deployer");
      }
    }
  });

export default task("replace-plugin-fee-recipient", "Changes the system admin to a new address")
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .addParam("strategies", "The addresses of the fw for which to update the fees", undefined, types.string)
  .setAction(async ({ newDeployer, strategies }, { ethers }) => {
    let tx: providers.TransactionResponse;

    const deployer = await ethers.getSigner(newDeployer);
    console.log("current deployer", deployer.address);

    const strategyAddresses = strategies.split(",");
    for (const strategyAddress of strategyAddresses) {
      const strategy = (await ethers.getContractAt("IonicERC4626", strategyAddress, deployer)) as IonicERC4626;

      const currentOwner = await strategy.callStatic.owner();
      console.log(`current owner ${currentOwner} of the strategy at ${strategy.address}`);
      const feeRecipient = await strategy.callStatic.feeRecipient();
      const performanceFee = await strategy.callStatic.performanceFee();
      const newPFS = BigNumber.from("50000000000000000");

      console.log({ previousPF: performanceFee.toString(), newPFS: newPFS.toString() });

      if (feeRecipient === newDeployer && performanceFee.toString() === newPFS.toString()) {
        console.log("fee recipient already set to the new deployer");
        continue;
      } else {
        console.log(`fee recipient needs to be replaced from ${feeRecipient} to ${newDeployer}`);
        tx = await strategy.updateFeeSettings(newPFS, newDeployer);
        await tx.wait();
        console.log("fee recipient updated to the new deployer");
      }
    }
  });
