import { task, types } from "hardhat/config";
import { Address, zeroAddress } from "viem";

enum Roles {
  REGISTRY_ROLE,
  SUPPLIER_ROLE,
  BORROWER_ROLE,
  LIQUIDATOR_ROLE,
  LEVERED_POSITION_ROLE
}

task("auth:set-user-role", "Sets the role of a new user")
  .addParam("pool", "Address of pool", undefined, types.string)
  .addParam("user", "Address of user", undefined, types.string)
  .addParam("role", "Enum of the role to use", undefined, types.int)
  .addParam("enabled", "If the user", undefined, types.boolean)
  .setAction(async ({ pool, user, role, enabled }, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    console.log({ pool, user, role: Roles[role], enabled });
    const authRegistry = await viem.getContractAt(
      "AuthoritiesRegistry",
      (await deployments.get("AuthoritiesRegistry")).address as Address
    );
    const poolAuthAddress = await authRegistry.read.poolsAuthorities([pool]);
    if (poolAuthAddress === zeroAddress) {
      console.log(`Pool authority for pool ${pool} does not exist`);
      return;
    }
    const poolAuth = await viem.getContractAt("PoolRolesAuthority", poolAuthAddress);
    const userHasCapability = await poolAuth.read.doesUserHaveRole([user, role]);
    if (userHasCapability === enabled) {
      console.log(`User ${user} already has ${Roles[role]} role for pool ${pool}`);
      return;
    } else {
      const tx = await authRegistry.write.setUserRole([pool, user, role, enabled]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Set user ${user} role: ${Roles[role]} pool ${pool}: ${tx} to ${enabled}`);
    }
  });
