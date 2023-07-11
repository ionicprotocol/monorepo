import { task, types } from "hardhat/config";

import { AuthoritiesRegistry } from "../../typechain/AuthoritiesRegistry";

task("auth:pool:create-authority", "Deploys a pool authority for a pool")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("pool", "Address of pool", undefined, types.string)
  .setAction(async ({ signer, pool }, { ethers }) => {
    const deployer = await ethers.getNamedSigner(signer);

    console.log("current deployer", deployer.address);
    console.log({ pool });
    const authRegistry = (await ethers.getContract("AuthoritiesRegistry", deployer)) as AuthoritiesRegistry;
    const poolAuth = await authRegistry.poolsAuthorities(pool);
    if (poolAuth !== ethers.constants.AddressZero) {
      const tx = await authRegistry.createPoolAuthority(pool);
      await tx.wait();
      console.log(`Created pool authority for pool ${pool}: ${tx.hash}`);
    } else {
      console.log(`Pool authority for pool ${pool} already exists at ${poolAuth}`);
    }
  });

task("auth:pool:reconfigure-authority", "Deploys a pool authority for a pool")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("pool", "Address of pool", undefined, types.string)
  .setAction(async ({ signer, pool }, { ethers }) => {
    const deployer = await ethers.getNamedSigner(signer);

    console.log("current deployer", deployer.address);
    console.log({ pool });
    const authRegistry = (await ethers.getContract("AuthoritiesRegistry", deployer)) as AuthoritiesRegistry;
    const tx = await authRegistry.reconfigureAuthority(pool);
    await tx.wait();
    console.log(`Reconfigured pool authority for pool ${pool}: ${tx.hash}`);
  });
