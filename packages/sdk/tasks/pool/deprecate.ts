import { task, types } from "hardhat/config";

import { FusePoolDirectory } from "../../lib/contracts/typechain/FusePoolDirectory";

export default task("pool:deprecate", "Whitelists a new comptroller implementation upgrade")
  .addOptionalParam("index", "Pool index for which to deprecate", undefined, types.string)
  .addOptionalParam("comptroller", "Pool address for which to deprecate", undefined, types.string)
  .setAction(async (taskArgs, { ethers }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
    if (taskArgs.index) {
      const tx = await fusePoolDirectory["_deprecatePool(uint256)"](taskArgs.index);
      await tx.wait();
    } else if (taskArgs.comptroller) {
      const tx = await fusePoolDirectory["_deprecatePool(address)"](taskArgs.comptroller);
      await tx.wait();
    } else {
      throw new Error("Must provide either index or comptroller");
    }
  });
