import { task, types } from "hardhat/config";
import { Address } from "viem";
import { prepareAndLogTransaction } from "../../chainDeploy/helpers/logging";

export default task("flywheel:nonaccruing", "Sets a flywheel as non-accruing in the comptroller")
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("pool", "address of comptroller", undefined, types.string)
  .setAction(async (taskArgs, { viem }) => {
    const publicClient = await viem.getPublicClient();
    const comptroller = await viem.getContractAt("ComptrollerFirstExtension", taskArgs.pool);

    const tx = await comptroller.write.addNonAccruingFlywheel([taskArgs.flywheel]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`added the flywheel to the non-accruing with tx ${tx}`);
  });

task("flywheel:remove", "remove a rewards distributor from a pool")
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("pool", "address of comptroller", undefined, types.string)
  .setAction(async (taskArgs, { viem, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    // extract the leftover rewards to the deployer
    const flywheel = await viem.getContractAt("IonicFlywheel", taskArgs.flywheel);
    let tx = await flywheel.write.setFlywheelRewards([deployer as Address]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("setFlywheelRewards: ", tx);

    const asComptrollerExtension = await viem.getContractAt("ComptrollerFirstExtension", taskArgs.pool);

    tx = await asComptrollerExtension.write._removeFlywheel([taskArgs.flywheel]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("_removeFlywheel: ", tx);
  });

task("flywheel:remove-all-flywheels", "remove a rewards distributor from a pool")
  .addParam("pool", "address of comptroller", undefined, types.string)
  .addParam("ion", "address of ionic token", undefined, types.string)
  .setAction(async (taskArgs, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );
    const pools = await poolDirectory.read.getAllPools();
    for (const pool of pools) {
      console.log(pool.name);
      const comptroller = await viem.getContractAt("IonicComptroller", pool.comptroller);
      const comptrollerAsFirstExtension = await viem.getContractAt("ComptrollerFirstExtension", pool.comptroller);
      const rewardsDistributors = await comptroller.read.getRewardsDistributors();
      const admin = await comptroller.read.admin();
      for (const rewardsDistributor of rewardsDistributors) {
        const flywheel = await viem.getContractAt("IonicFlywheel", rewardsDistributor);
        const fwr = await flywheel.read.flywheelRewards();
        const flywheelRewards = await viem.getContractAt("IonicFlywheelDynamicRewards", fwr);
        if (flywheelRewards.address !== "0x1155b614971f16758C92c4890eD338C9e3ede6b7") {
        const rw = await flywheelRewards.read.rewardToken();
          if (rw === taskArgs.ion) {
            const tx = await flywheel.write.setFlywheelRewards([deployer as Address]);
            await publicClient.waitForTransactionReceipt({ hash: tx });
            console.log("setFlywheelRewards: ", tx);
            if (admin !== deployer) {
              await prepareAndLogTransaction({
                contractInstance: comptrollerAsFirstExtension,
                functionName: "_removeFlywheel",
                args: [flywheel.address],
                description: "_removeFlywheel",
                inputs: [{ internalType: "address", name: "flywheel", type: "address" }]
              });
            } else {
              const tx = await comptrollerAsFirstExtension.write._removeFlywheel([flywheel.address]);
              await publicClient.waitForTransactionReceipt({ hash: tx });
              console.log("_removeFlywheel: ", tx);
            }

            console.log(`${flywheel.address} removed.`);
          } else {
            console.log(`${flywheel.address} is not ION flywheel, skiping removal..`);
          }
        }
      }
    }
  });