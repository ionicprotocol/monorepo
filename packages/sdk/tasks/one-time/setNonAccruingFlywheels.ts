import { task } from "hardhat/config";

import { Comptroller } from "../../lib/contracts/typechain/Comptroller";

export default task("flyhwheels:nonaccruing", "Sets a flywheel as non-accruing in the comptroller").setAction(
  async ({}, { ethers }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const jarvisPoolAddress = "0x31d76A64Bc8BbEffb601fac5884372DEF910F044";
    const epxFlywheelAddress = "0xC6431455AeE17a08D6409BdFB18c4bc73a4069E4";
    const dddFlywheelAddress = "0x851Cc0037B6923e60dC81Fa79Ac0799cC983492c";

    const comptroller = (await ethers.getContractAt(
      "Comptroller.sol:Comptroller",
      jarvisPoolAddress,
      deployer
    )) as Comptroller;

    let tx;
    tx = await comptroller.addNonAccruingFlywheel(epxFlywheelAddress);
    await tx.wait();
    console.log(`added the EPX flywheel to the non-accruing with tx ${tx.hash}`);

    tx = await comptroller.addNonAccruingFlywheel(dddFlywheelAddress);
    await tx.wait();
    console.log(`added the DDD flywheel to the non-accruing with tx ${tx.hash}`);
  }
);
