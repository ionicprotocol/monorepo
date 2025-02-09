import { task, types } from "hardhat/config";
import { Address, zeroAddress } from "viem";
import { prepareAndLogTransaction } from "../../chainDeploy/helpers/logging";

enum Roles {
  REGISTRY_ROLE,
  SUPPLIER_ROLE,
  BORROWER_ROLE,
  LIQUIDATOR_ROLE,
  LEVERED_POSITION_ROLE,
  CLAIMER_ROLE
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
      if (1) {
        await prepareAndLogTransaction({
          contractInstance: authRegistry,
          functionName: "setUserRole",
          args: [pool, user, role, enabled],
          description: `Setting user ${user} role: ${Roles[role]} for pool ${pool} to ${enabled}`,
          inputs: [
            { internalType: "address", name: "pool", type: "address" },
            { internalType: "address", name: "user", type: "address" },
            { internalType: "uint8", name: "role", type: "uint8" },
            { internalType: "bool", name: "enabled", type: "bool" }
          ]
        });
      } else {
        const tx = await authRegistry.write.setUserRole([pool, user, role, enabled]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`Set user ${user} role: ${Roles[role]} pool ${pool}: ${tx} to ${enabled}`);
      }
    }
  });

task("auth:set-role-capability", "Sets the capability of a role")
  .addParam("pool", "Address of pool", undefined, types.string)
  .addParam("role", "Enum of the role to use", undefined, types.int)
  .addParam("target", "Address of the target contract", undefined, types.string)
  .addParam("functionSig", "Function signature to set capability for", undefined, types.string)
  .addParam("enabled", "If the capability should be enabled or not", undefined, types.boolean)
  .setAction(async ({ pool, role, target, functionSig, enabled }, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    console.log({ pool, role: Roles[role], target, functionSig, enabled });
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
    const currentCapability = await poolAuth.read.doesRoleHaveCapability([role, target, functionSig]);
    if (currentCapability === enabled) {
      console.log(`Role ${Roles[role]} already has capability for function ${functionSig} on target ${target}`);
      return;
    } else {
      if (1) {
        await prepareAndLogTransaction({
          contractInstance: poolAuth,
          functionName: "setRoleCapability",
          args: [role, target, functionSig, enabled],
          description: `Updating role capability for function ${functionSig} on target ${target}`,
          inputs: [
            { internalType: "uint8", name: "role", type: "uint8" },
            { internalType: "address", name: "target", type: "address" },
            { internalType: "bytes4", name: "functionSig", type: "bytes4" },
            { internalType: "bool", name: "enabled", type: "bool" }
          ]
        });
      } else {
        const tx = await poolAuth.write.setRoleCapability([role, target, functionSig, enabled]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(
          `Set role ${Roles[role]} capability for function ${functionSig} on target ${target} to ${enabled}: ${tx}`
        );
      }
    }
  });
