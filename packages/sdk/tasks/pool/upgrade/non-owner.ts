import { task, types } from "hardhat/config";

import { Comptroller } from "../../../typechain/Comptroller";
import { Unitroller } from "../../../typechain/Unitroller";

task("non-owner-pool:upgrade")
  .addParam("comptrollerAddress", "The comptroller implementation address", undefined, types.string)
  .addParam("poolAddress", "The pool address", undefined, types.string)
  .setAction(async ({ comptrollerAddress, poolAddress }, { ethers }) => {
    const signer = await ethers.getNamedSigner("deployer");
    // pools to upgrade
    const pools: string[] = [poolAddress];

    const comptrollerImpl = (await ethers.getContractAt(
      "Comptroller.sol:Comptroller",
      comptrollerAddress,
      signer
    )) as Comptroller;

    for (let i = 0; i < pools.length; i++) {
      const asUnitroller = (await ethers.getContractAt("Unitroller", pools[i], signer)) as Unitroller;

      const currentImpl = await asUnitroller.callStatic.comptrollerImplementation();
      if (currentImpl != comptrollerImpl.address) {
        console.log(`current impl is ${currentImpl}`);
        console.log(`should be ${comptrollerImpl.address}`);

        let tx = await asUnitroller._registerExtension(comptrollerImpl.address, currentImpl);
        await tx.wait();
        console.log(`new comptroller set with ${tx.hash}`);
        console.log(`updating the extensions`);

        tx = await asUnitroller._upgrade();
        await tx.wait();
        console.log(`extensions updated ${tx.hash}`);
      } else {
        console.log(`already the needed impl ${currentImpl}`);
      }
    }
  });
