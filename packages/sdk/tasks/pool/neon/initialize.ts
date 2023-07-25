import { task, types } from "hardhat/config";

import { PoolDirectory } from "../../../typechain/PoolDirectory";

export default task("neon:pool:initialize", "Initializes a neon pool")
  .addParam("comptroller", "The address of the comptroller", undefined, types.string)
  .addParam("enforceWhitelist", "Enforce whitelist", false, types.boolean)
  .addParam("closeFactor", "The close factor of the comptroller", 50, types.int)
  .addParam("liquidationIncentive", "The liquidation incentive for the pool", 8, types.int)
  .setAction(async ({ comptroller, enforceWhitelist, closeFactor, liquidationIncentive }, { ethers }) => {
    const deployer = await ethers.getNamedSigner("deployer");
    const poolDirectory = (await ethers.getContract("PoolDirectory", deployer)) as PoolDirectory;

    const closeFactorBN = ethers.utils.parseUnits((closeFactor / 100).toString());
    const liquidationIncentiveBN = ethers.utils.parseUnits((liquidationIncentive / 100).toString());
    const mpo = await ethers.getContract("MasterPriceOracle", deployer);

    console.log(`Initializing pool ${comptroller} with enforceWhitelist ${enforceWhitelist}`);
    const tx = await poolDirectory.initializeNeonPool(
      comptroller,
      enforceWhitelist,
      closeFactorBN,
      liquidationIncentiveBN,
      mpo.address
    );
    await tx.wait();
    console.log("pool initialized", tx.hash);
  });
