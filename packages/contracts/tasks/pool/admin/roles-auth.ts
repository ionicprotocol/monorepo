import { task, types } from "hardhat/config";
import { Address } from "viem";
import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";

task("pool:whitelist:borrowers", "Upgrade all upgradeable markets across all pools")
  .addParam("pool", "The address of the pool", undefined, types.string)
  .setAction(async ({ admin, pool }, { viem }) => {
    const publicClient = await viem.getPublicClient();
    const comptroller = await viem.getContractAt("IonicComptroller", pool);

    const allBorrowers = await comptroller.read.getAllBorrowers();
    const arrTrue = allBorrowers.map(() => true);
    const tx = await comptroller.write._setWhitelistStatuses([allBorrowers, arrTrue]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`whitelisted all borrowers to be able to supply and borrow`);
  });

task("pool:pause:guardian", "Set pause guardian on all pools")
  .addParam("guardian", "New guardian", undefined, types.string)
  .addOptionalParam("admin", "Named account from which to set the pause guardian on the pool", "deployer", types.string)
  .setAction(async (taskArgs, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();

    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );

    const [, poolData] = await poolDirectory.read.getActivePools();

    for (const pool of poolData) {
      const poolExtension = await viem.getContractAt("IonicComptroller", pool.comptroller);

      const currentPauseGuardian = await poolExtension.read.pauseGuardian();
      console.log(`pool ${pool.comptroller} guardian ${currentPauseGuardian}`);
      if (currentPauseGuardian.toLowerCase() === taskArgs.guardian.toLowerCase()) {
        console.log("Guardian already set to the new guardian. Skipping.");
        continue;
      }
      const owner = await poolExtension.read.admin();
      if (owner.toLowerCase() !== deployer.toLowerCase()) {
        console.log(`Admin ${deployer} is not the owner of pool ${pool.comptroller}. Printing data.`);
        await prepareAndLogTransaction({
          contractInstance: poolExtension,
          functionName: "_setPauseGuardian",
          args: [taskArgs.guardian],
          description: `Set the pause guardian on pool ${pool.comptroller} to ${taskArgs.guardian}`,
          inputs: [{ internalType: "address", name: "newPauseGuardian", type: "address" }]
        });
      } else {
        const result = await poolExtension.simulate._setPauseGuardian(taskArgs.guardian);
        if (result.result === 0n) {
          const tx = await poolExtension.write._setPauseGuardian([taskArgs.guardian]);
          console.log(`Set the pause guardian on pool ${pool.comptroller} to ${taskArgs.guardian}: ${tx}`);
        } else {
          console.log("result: ", result.toString());
          console.log(`Failed to set the pause guardian on pool ${pool.comptroller} to ${taskArgs.guardian}`);
        }
      }
      // await tx.wait();
    }
  });
