import { task } from "hardhat/config";
import { Address } from "viem";

export default task("edit-deployers", "Edit deployers")
  .addParam("deployers", "Comma-separated deployers")
  .addOptionalParam("status", "Add or remove deployer")
  .setAction(async ({ deployers: _deployers, status: _status }, { viem, deployments }) => {
    const status = _status ? _status === "true" : true;
    console.log("status: ", status);
    const deployers = _deployers.split(",");
    console.log("deployers: ", deployers);

    const fpd = await viem.getContractAt("PoolDirectory", (await deployments.get("PoolDirectory")).address as Address);
    const tx = await fpd._editDeployerWhitelist(deployers, status);

    console.log("_editDeployerWhitelist tx: ", tx);
    const receipt = await tx.wait();
    console.log("_editDeployerWhitelist tx mined: ", receipt.transactionHash);
  });

task("edit-deployer-whitelist-enforcement", "Edit deployer whitelist enforcement")
  .addParam("enforce", "Enforce whitelist?")
  .setAction(async ({ enforce: _enforce }, { viem, deployments }) => {
    const enforce = _enforce === "true";

    const fpd = await viem.getContractAt("PoolDirectory", (await deployments.get("PoolDirectory")).address as Address);
    const current = await fpd.enforceDeployerWhitelist();
    console.log("current: ", current);
    if (current === enforce) {
      console.log("Already set to ", enforce);
      return;
    }
    const tx = await fpd._setDeployerWhitelistEnforcement(enforce);

    console.log("_setDeployerWhitelistEnforcement tx: ", tx);
    const receipt = await tx.wait();
    console.log("_setDeployerWhitelistEnforcement tx mined: ", receipt.transactionHash);
  });
