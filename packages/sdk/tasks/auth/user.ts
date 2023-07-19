import { task, types } from "hardhat/config";

import { AuthoritiesRegistry } from "../../typechain/AuthoritiesRegistry";
import { PoolRolesAuthority } from "../../typechain/PoolRolesAuthority";

enum Roles {
  REGISTRY_ROLE,
  SUPPLIER_ROLE,
  BORROWER_ROLE,
  LIQUIDATOR_ROLE,
  LEVERED_POSITION_ROLE
}

task("auth:set-user-role", "Sets the role of a new user")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("pool", "Address of pool", undefined, types.string)
  .addParam("user", "Address of user", undefined, types.string)
  .addParam("role", "Enum of the role to use", undefined, types.int)
  .addParam("enabled", "If the user", undefined, types.boolean)
  .setAction(async ({ signer, pool, user, role, enabled }, { ethers }) => {
    const deployer = await ethers.getNamedSigner(signer);

    console.log("current deployer", deployer.address);
    console.log({ pool, user, role: Roles[role], enabled });
    const authRegistry = (await ethers.getContract("AuthoritiesRegistry", deployer)) as AuthoritiesRegistry;
    const poolAuthAddress = await authRegistry.callStatic.poolsAuthorities(pool);
    if (poolAuthAddress === ethers.constants.AddressZero) {
      console.log(`Pool authority for pool ${pool} does not exist`);
      return;
    }
    const poolAuth = (await ethers.getContractAt(
      "PoolRolesAuthority",
      poolAuthAddress,
      deployer
    )) as PoolRolesAuthority;
    const userHasCapability = await poolAuth.callStatic.doesUserHaveRole(user, role);
    if (userHasCapability === enabled) {
      console.log(`User ${user} already has ${Roles[role]} role for pool ${pool}`);
      return;
    } else {
      const tx = await authRegistry.setUserRole(pool, user, role, enabled);
      await tx.wait();
      console.log(`Set user ${user} role: ${Roles[role]} pool ${pool}: ${tx.hash} to ${enabled}`);
    }
  });
