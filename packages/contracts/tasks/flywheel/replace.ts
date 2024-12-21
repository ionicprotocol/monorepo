import { chainIdtoChain } from "@ionicprotocol/chains";
import { task } from "hardhat/config";
import { type Address, zeroAddress } from "viem";

task("flywheels:booster:update").setAction(async ({}, { viem, getChainId, deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const chainId = parseInt(await getChainId());
  const publicClient = await viem.getPublicClient({ chain: chainIdtoChain[chainId] });
  const walletClient = await viem.getWalletClient(deployer as Address, { chain: chainIdtoChain[chainId] });
  const poolDirectory = await viem.getContractAt(
    "PoolDirectory",
    (await deployments.get("PoolDirectory")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );
  const newBooster = await viem.getContractAt(
    "LooplessFlywheelBooster",
    (await deployments.get("LooplessFlywheelBooster")).address as Address,
    { client: { public: publicClient, wallet: walletClient } }
  );

  const [ids, poolDatas] = await poolDirectory.read.getActivePools();
  for (const poolData of poolDatas) {
    const pool = await viem.getContractAt("ComptrollerFirstExtension", poolData.comptroller, {
      client: { public: publicClient, wallet: walletClient }
    });
    const fws = await pool.read.getAccruingFlywheels();

    for (const fw of fws) {
      const flywheel = await viem.getContractAt("IonicFlywheel", fw, {
        client: { public: publicClient, wallet: walletClient }
      });
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
