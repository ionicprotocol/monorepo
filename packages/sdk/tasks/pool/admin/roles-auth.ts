import { task, types } from "hardhat/config";

import { Comptroller } from "../../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../../typechain/ComptrollerFirstExtension";

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
