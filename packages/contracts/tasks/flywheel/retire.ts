import { task, types } from "hardhat/config";
import { Address } from "viem";

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
