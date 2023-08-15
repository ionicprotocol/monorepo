import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { AuthoritiesRegistry } from "../../typechain/AuthoritiesRegistry";
import { PoolRolesAuthority } from "../../typechain/PoolRolesAuthority";
import { ProxyAdmin } from "../../typechain/ProxyAdmin";

task("auth:pool:create-authority", "Deploys a pool authority for a pool")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("pool", "Address of pool", undefined, types.string)
  .setAction(async ({ signer, pool }, { ethers }) => {
    const deployer = await ethers.getNamedSigner(signer);

    console.log("current deployer", deployer.address);
    console.log({ pool });
    const authRegistry = (await ethers.getContract("AuthoritiesRegistry", deployer)) as AuthoritiesRegistry;
    const poolAuth = await authRegistry.poolsAuthorities(pool);
    if (poolAuth == ethers.constants.AddressZero) {
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
    const poolAuth = await authRegistry.callStatic.poolsAuthorities(pool);
    const latestImpl = await authRegistry.callStatic.poolAuthLogic();

    const dpa = await ethers.getContract("DefaultProxyAdmin") as ProxyAdmin;
    let tx = await dpa.upgrade(poolAuth, latestImpl);
    await tx.wait();
    console.log(`upgraded the auth ${poolAuth} for ${pool}: ${tx.hash}`);

    tx = await authRegistry.reconfigureAuthority(pool);
    await tx.wait();
    console.log(`Reconfigured pool authority for pool ${pool}: ${tx.hash}`);
  });

task("auth:pool:supply", "Set ability to supply for a pool")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("pool", "Address of pool", undefined, types.string)
  .addParam("open", "If supplying is open or not", true, types.boolean)
  .setAction(async ({ signer, pool, open }, hre) => {
    const deployer = await hre.ethers.getNamedSigner(signer);
    console.log("current deployer", deployer.address);
    const poolAuth = await setUpAuth(hre, deployer, pool);
    if (poolAuth === null) {
      return;
    }
    let tx;
    if (open === true) {
      tx = await poolAuth.openPoolSupplierCapabilities(pool);
      await tx.wait();
    } else {
      tx = await poolAuth.closePoolSupplierCapabilities(pool);
      await tx.wait();
    }
    console.log(`Set ability to supply for pool ${pool} to ${open}: ${tx.hash}`);
  });

task("auth:pool:borrow", "Set ability to borrow for a pool")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("pool", "Address of pool", undefined, types.string)
  .addParam("open", "If borrowing is open or not", true, types.boolean)
  .setAction(async ({ signer, pool, open }, hre) => {
    const deployer = await hre.ethers.getNamedSigner(signer);
    console.log("current deployer", deployer.address);

    const poolAuth = await setUpAuth(hre, deployer, pool);
    if (poolAuth === null) {
      return;
    }

    let tx;
    if (open === true) {
      tx = await poolAuth.openPoolBorrowerCapabilities(pool);
      await tx.wait();
    } else {
      tx = await poolAuth.closePoolBorrowerCapabilities(pool);
      await tx.wait();
    }
    console.log(`Set ability to supply for pool ${pool} to ${open}: ${tx.hash}`);
  });

async function setUpAuth(
  hre: HardhatRuntimeEnvironment,
  deployer: SignerWithAddress,
  pool: string
): Promise<PoolRolesAuthority | null> {
  const authRegistry = (await hre.ethers.getContract("AuthoritiesRegistry", deployer)) as AuthoritiesRegistry;
  const poolAuthAddress = await authRegistry.callStatic.poolsAuthorities(pool);
  if (poolAuthAddress === hre.ethers.constants.AddressZero) {
    console.log(`Pool authority for pool ${pool} does not exist`);
    return null;
  }
  const poolRolesAuth = (await hre.ethers.getContractAt(
    "PoolRolesAuthority",
    poolAuthAddress,
    deployer
  )) as PoolRolesAuthority;

  return poolRolesAuth;
}
