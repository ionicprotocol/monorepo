import { BigNumber } from "ethers";
import { task, types } from "hardhat/config";

import { IonicComptroller } from "../../../typechain";
import { Comptroller } from "../../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../../typechain/ComptrollerFirstExtension";
import { PoolDirectory } from "../../../typechain/PoolDirectory";

task("pool:whitelist:borrowers", "Upgrade all upgradeable markets across all pools")
  .addParam("pool", "The address of the pool", undefined, types.string)
  .addOptionalParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .setAction(async ({ admin, pool }, { ethers }) => {
    const signer = await ethers.getNamedSigner(admin);

    const comptroller = (await ethers.getContractAt("Comptroller.sol:Comptroller", pool, signer)) as Comptroller;
    const comptrollerAsExtension = (await ethers.getContractAt(
      "ComptrollerFirstExtension",
      pool.comptroller,
      signer
    )) as ComptrollerFirstExtension;

    const allBorrowers = await comptrollerAsExtension.callStatic.getAllBorrowers();
    const arrTrue = allBorrowers.map(() => true);
    const tx = await comptroller._setWhitelistStatuses(allBorrowers, arrTrue);
    await tx.wait();
    console.log(`whitelisted all borrowers to be able to supply and borrow`);
  });

task("pool:pause:guardian", "Set pause guardian on all pools")
  .addParam("guardian", "New guardian", undefined, types.string)
  .addOptionalParam("admin", "Named account from which to set the pause guardian on the pool", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    const admin = await hre.ethers.getNamedSigner(taskArgs.admin);

    const poolDirectory = (await hre.ethers.getContract("PoolDirectory")) as PoolDirectory;

    const [, poolData] = await poolDirectory.callStatic.getActivePools();

    for (const pool of poolData) {
      const poolExtension = (await hre.ethers.getContractAt(
        "IonicComptroller",
        pool.comptroller,
        admin
      )) as IonicComptroller;

      const currentPauseGuardian = await poolExtension.callStatic.pauseGuardian();
      console.log(`pool ${pool.comptroller} guardian ${currentPauseGuardian}`);
      if (currentPauseGuardian.toLowerCase() === taskArgs.guardian.toLowerCase()) {
        console.log("Guardian already set to the new guardian. Skipping.");
        continue;
      }
      const owner = await poolExtension.callStatic.admin();
      if (owner.toLowerCase() !== admin.address.toLowerCase()) {
        console.log(`Admin ${admin.address} is not the owner of pool ${pool.comptroller}. Printing data.`);
        const data = await poolExtension.populateTransaction._setPauseGuardian(taskArgs.guardian);
        console.log("data: ", data);
      } else {
        const result = await poolExtension.callStatic._setPauseGuardian(taskArgs.guardian);
        if (result.eq(BigNumber.from(0))) {
          const tx = await poolExtension._setPauseGuardian(taskArgs.guardian);
          await tx.wait();
          console.log(`Set the pause guardian on pool ${pool.comptroller} to ${taskArgs.guardian}: ${tx.hash}`);
        } else {
          console.log("result: ", result.toString());
          console.log(`Failed to set the pause guardian on pool ${pool.comptroller} to ${taskArgs.guardian}`);
        }
      }
      // await tx.wait();
    }
  });
