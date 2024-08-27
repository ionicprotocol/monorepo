import { task } from "hardhat/config";
import { Address, zeroAddress } from "viem";

task("flywheels:booster:update").setAction(async ({}, { viem, getChainId, deployments }) => {
  const publicClient = await viem.getPublicClient();
  const poolDirectory = await viem.getContractAt(
    "PoolDirectory",
    (await deployments.get("PoolDirectory")).address as Address
  );
  const newBooster = await viem.getContractAt(
    "LooplessFlywheelBooster",
    (await deployments.get("LooplessFlywheelBooster")).address as Address
  );

  const [ids, poolDatas] = await poolDirectory.read.getActivePools();
  for (const poolData of poolDatas) {
    const pool = await viem.getContractAt("ComptrollerFirstExtension", poolData.comptroller);
    const fws = await pool.read.getAccruingFlywheels();

    for (const fw of fws) {
      const flywheel = await viem.getContractAt("IonicFlywheel", fw);
      const currentBooster = await flywheel.read.flywheelBooster();
      if (currentBooster != zeroAddress && currentBooster != newBooster.address) {
        const tx = await flywheel.write.setBooster([newBooster.address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`replaced ${currentBooster} with ${newBooster.address} for ${flywheel.address}`);
      } else {
        console.log(
          `current booster ${currentBooster} NOT REPLACED with ${newBooster.address} for ${flywheel.address}`
        );
      }
    }
  }
});
