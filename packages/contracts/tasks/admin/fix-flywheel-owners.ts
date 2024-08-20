import { task, types } from "hardhat/config";
import { Hash, zeroAddress } from "viem";

task("deploy-fwr", "Changes the system admin to a new address")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("flywheel", "The address of the new deployer", undefined, types.string)
  .addParam("name", "Name of the FW rewarsd", undefined, types.string)
  .setAction(async ({ signer, flywheel, name }, { viem, deployments, getNamedAccounts }) => {
    const named = await getNamedAccounts();
    const deployer = named[signer];

    console.log("current deployer", deployer);
    console.log("flywheel", flywheel);
    console.log("name", name);
    const rewards = await deployments.deploy(`FlywheelStaticRewards_${name}`, {
      contract: "FlywheelStaticRewards",
      from: deployer,
      log: true,
      args: [
        flywheel, // flywheel
        deployer, // owner
        zeroAddress // Authority
      ],
      waitConfirmations: 1
    });

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(deployer);

    const tx = await sdk.setFlywheelRewards(flywheel, rewards.address);
    await tx.wait();
  });

task("replace-fw-fee-recipient", "Changes the system admin to a new address")
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .addParam("fwAddresses", "The addresses of the strategies for which to update the fees", undefined, types.string)
  .setAction(async ({ newDeployer, fwAddresses }, { viem, getNamedAccounts }) => {
    let tx: Hash;
    const publicClient = await viem.getPublicClient();

    const named = await getNamedAccounts();
    const deployer = named[newDeployer];
    console.log("current deployer", deployer);

    const flywheelAddresses = fwAddresses.split(",");
    for (const flywheelAddress of flywheelAddresses) {
      const flywheelCore = await viem.getContractAt("IonicFlywheelCore", flywheelAddress);

      const currentOwner = await flywheelCore.read.owner();
      console.log(`current owner ${currentOwner} of the flywheel at ${flywheelCore.address}`);
      const feeRecipient = await flywheelCore.read.feeRecipient();
      const performanceFee = await flywheelCore.read.performanceFee();
      if (feeRecipient === newDeployer) {
        console.log("fee recipient already set to the new deployer");
        continue;
      } else {
        console.log(`fee recipient needs to be replaced from ${feeRecipient} to ${newDeployer}`);
        tx = await flywheelCore.write.updateFeeSettings([performanceFee, newDeployer]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("fee recipient updated to the new deployer");
      }
    }
  });

export default task("replace-plugin-fee-recipient", "Changes the system admin to a new address")
  .addParam("newDeployer", "The address of the new deployer", undefined, types.string)
  .addParam("strategies", "The addresses of the fw for which to update the fees", undefined, types.string)
  .setAction(async ({ newDeployer, strategies }, { viem, getNamedAccounts }) => {
    let tx: Hash;
    const publicClient = await viem.getPublicClient();

    const named = await getNamedAccounts();
    const deployer = named[newDeployer];
    console.log("current deployer", deployer);

    const strategyAddresses = strategies.split(",");
    for (const strategyAddress of strategyAddresses) {
      const strategy = await viem.getContractAt("IonicERC4626", strategyAddress);

      const currentOwner = await strategy.read.owner();
      console.log(`current owner ${currentOwner} of the strategy at ${strategy.address}`);
      const feeRecipient = await strategy.read.feeRecipient();
      const performanceFee = await strategy.read.performanceFee();
      const newPFS = 50000000000000000n;

      console.log({ previousPF: performanceFee.toString(), newPFS: newPFS.toString() });

      if (feeRecipient === newDeployer && performanceFee.toString() === newPFS.toString()) {
        console.log("fee recipient already set to the new deployer");
        continue;
      } else {
        console.log(`fee recipient needs to be replaced from ${feeRecipient} to ${newDeployer}`);
        tx = await strategy.write.updateFeeSettings([newPFS, newDeployer]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("fee recipient updated to the new deployer");
      }
    }
  });
