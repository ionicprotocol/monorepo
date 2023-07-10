import { task, types } from "hardhat/config";

import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { MidasFlywheel as IonicFlywheel } from "../../typechain/MidasFlywheel";

export default task("flyhwheel:nonaccruing", "Sets a flywheel as non-accruing in the comptroller")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("pool", "address of comptroller", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const deployer = await hre.ethers.getNamedSigner(taskArgs.signer);

    const comptroller = (await hre.ethers.getContractAt(
      "ComptrollerFirstExtension",
      taskArgs.pool,
      deployer
    )) as ComptrollerFirstExtension;

    const tx = await comptroller.addNonAccruingFlywheel(taskArgs.flywheel);
    await tx.wait();
    console.log(`added the flywheel to the non-accruing with tx ${tx.hash}`);
  });

task("flywheel:remove", "remove a rewards distributor from a pool")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("pool", "address of comptroller", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const deployer = await hre.ethers.getNamedSigner(taskArgs.signer);

    // extract the leftover rewards to the deployer
    const flywheel = (await hre.ethers.getContractAt("MidasFlywheel", taskArgs.flywheel, deployer)) as IonicFlywheel;
    let tx = await flywheel.setFlywheelRewards(deployer.address);
    await tx.wait();
    console.log("setFlywheelRewards: ", tx.hash);

    const asComptrollerExtension = (await hre.ethers.getContractAt(
      "ComptrollerFirstExtension",
      taskArgs.pool,
      deployer
    )) as ComptrollerFirstExtension;

    tx = await asComptrollerExtension._removeFlywheel(taskArgs.flywheel);
    await tx.wait();
    console.log("_removeFlywheel: ", tx.hash);
  });
