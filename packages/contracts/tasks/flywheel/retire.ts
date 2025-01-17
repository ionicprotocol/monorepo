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

  task("flywheel:batch-remove", "remove multiple rewards distributors from a pool")
  .setAction(async (_, { run }) => {
    const pool = "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13";
    const flywheels = [
      "0xf42dBd423970fd6735a7CE2d850aA85897C79eeE",
      "0xc39441b305705AfD07de97237bC835a4501AbbEC",
      "0xf638994B1155DfE2cbDd9589365960DD8dcDE6B4",
      "0xC8B73Ea80fBD12e5216F3D2424D3971fAd3e65F9",
      "0xAC717cd20a72470Cb764B518dE561E1fFF41cC22",
      "0x1d0a712aE0162431E0573A8a735D02a29805d124",
      "0x46F00C2D10fd01a8dc7db996aC4df8FF481B3424",
    ];

    for (const flywheel of flywheels) {
      console.log(`Removing flywheel: ${flywheel} from pool: ${pool}`);

      await run("flywheel:remove", {
        pool,
        flywheel,
      });

      console.log(`Successfully removed flywheel: ${flywheel}`);
    }

    console.log("Batch removal complete.");
  });
