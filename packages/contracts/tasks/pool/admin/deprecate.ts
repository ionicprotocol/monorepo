import { task, types } from "hardhat/config";

import { Address } from "viem";

export default task("pool:deprecate", "Whitelists a new comptroller implementation upgrade")
  .addOptionalParam("index", "Pool index for which to deprecate", undefined, types.string)
  .addOptionalParam("comptroller", "Pool address for which to deprecate", undefined, types.string)
  .setAction(async (taskArgs, { viem, deployments }) => {
    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );
    if (taskArgs.index) {
      const tx = await poolDirectory.write._deprecatePool(taskArgs.index);
      console.log("tx: ", tx);
    } else if (taskArgs.comptroller) {
      const tx = await poolDirectory.write._deprecatePool(taskArgs.comptroller);
      console.log("tx: ", tx);
    } else {
      throw new Error("Must provide either index or comptroller");
    }
  });
