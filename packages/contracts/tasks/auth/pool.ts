import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  Address,
  Chain,
  GetContractReturnType,
  HttpTransport,
  LocalAccount,
  WalletClient,
  WalletRpcSchema,
  zeroAddress
} from "viem";
import { poolRolesAuthorityAbi } from "../../../sdk/src/generated";

task("auth:pool:create-authority", "Deploys a pool authority for a pool")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("pool", "Address of pool", undefined, types.string)
  .setAction(async ({ pool }, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    console.log({ pool });
    const authRegistry = await viem.getContractAt(
      "AuthoritiesRegistry",
      (await deployments.get("AuthoritiesRegistry")).address as Address
    );
    const poolAuth = await authRegistry.read.poolsAuthorities([pool]);
    if (poolAuth === zeroAddress) {
      const tx = await authRegistry.write.createPoolAuthority([pool]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Created pool authority for pool ${pool}: ${tx}`);
    } else {
      console.log(`Pool authority for pool ${pool} already exists at ${poolAuth}`);
    }
  });

task("auth:pool:reconfigure-authority", "Deploys a pool authority for a pool")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("pool", "Address of pool", undefined, types.string)
  .setAction(async ({ pool }, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();
    console.log({ pool });

    const authRegistry = await viem.getContractAt(
      "AuthoritiesRegistry",
      (await deployments.get("AuthoritiesRegistry")).address as Address
    );
    const poolAuthAddress = await authRegistry.read.poolsAuthorities(pool);
    console.log(`pool auth ${poolAuthAddress} `);
    const latestImpl = await authRegistry.read.poolAuthLogic();
    console.log(`latest impl ${latestImpl} `);

    const dpa = await viem.getContractAt(
      "DefaultProxyAdmin",
      (await deployments.get("DefaultProxyAdmin")).address as Address
    );
    const poolAuthImplementation = await dpa.read.getProxyImplementation([poolAuthAddress]);
    console.log(`Current implementation of pool auth ${poolAuthAddress} is ${poolAuthImplementation}`);

    let tx;
    if ((poolAuthImplementation as Address).toLowerCase() != latestImpl.toLowerCase()) {
      // upgrade
      tx = await dpa.write.upgrade([poolAuthAddress, latestImpl]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`upgraded the auth ${poolAuthAddress} for ${pool}: ${tx}`);
    }

    // reconfigure
    tx = await authRegistry.write.reconfigureAuthority([pool]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`Reconfigured pool authority for pool ${pool}: ${tx}`);
  });

task("auth:pool:supply", "Set ability to supply for a pool")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("pool", "Address of pool", undefined, types.string)
  .addParam("open", "If supplying is open or not", true, types.boolean)
  .setAction(async ({ pool, open }, hre) => {
    const publicClient = await hre.viem.getPublicClient();
    const poolAuth = await setUpAuth(hre, pool);
    console.log("poolAuth: ", poolAuth?.address);
    if (!poolAuth) {
      return;
    }
    let tx;
    if (open === true) {
      tx = await poolAuth!.write.openPoolSupplierCapabilities([pool]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    } else {
      tx = await poolAuth!.write.closePoolSupplierCapabilities(pool);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    }
    console.log(`Set ability to supply for pool ${pool} to ${open}: ${tx}`);
  });

task("auth:pool:borrow", "Set ability to borrow for a pool")
  .addParam("pool", "Address of pool", undefined, types.string)
  .addParam("open", "If borrowing is open or not", true, types.boolean)
  .setAction(async ({ pool, open }, hre) => {
    const publicClient = await hre.viem.getPublicClient();
    const poolAuth = await setUpAuth(hre, pool);
    console.log("poolAuth: ", poolAuth?.address);
    if (!poolAuth) {
      throw new Error("Pool authority not found");
    }

    let tx;
    if (open === true) {
      tx = await poolAuth!.write.openPoolBorrowerCapabilities([pool]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    } else {
      tx = await poolAuth!.write.closePoolBorrowerCapabilities([pool]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    }
    console.log(`Set ability to borrow for pool ${pool} to ${open}: ${tx}`);
  });

task("auth:pool:liquidate", "Set ability to liqiuidate for a pool")
  .addParam("pool", "Address of pool", undefined, types.string)
  .addParam("open", "If liquidations are open or not", true, types.boolean)
  .setAction(async ({ pool, open }, hre) => {
    const publicClient = await hre.viem.getPublicClient();
    const poolAuth = await setUpAuth(hre, pool);
    if (poolAuth === null) {
      return;
    }

    let tx;
    if (open === true) {
      tx = await poolAuth!.write.configureOpenPoolLiquidatorCapabilities([pool]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    } else {
      tx = await poolAuth!.write.configureClosedPoolLiquidatorCapabilities([pool]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
    }
    console.log(`Set ability to liquidate for pool ${pool} to ${open}: ${tx}`);
  });

async function setUpAuth(
  hre: HardhatRuntimeEnvironment,
  pool: Address
): Promise<
  | GetContractReturnType<
      typeof poolRolesAuthorityAbi,
      WalletClient<HttpTransport, Chain, LocalAccount<string, Address>, WalletRpcSchema>
    >
  | undefined
> {
  const authRegistry = await hre.viem.getContractAt(
    "AuthoritiesRegistry",
    (await hre.deployments.get("AuthoritiesRegistry")).address as Address
  );
  const poolAuthAddress = await authRegistry.read.poolsAuthorities([pool]);
  if (poolAuthAddress === zeroAddress) {
    console.log(`Pool authority for pool ${pool} does not exist`);
    return;
  }
  const poolRolesAuth = await hre.viem.getContractAt("PoolRolesAuthority", poolAuthAddress);

  return poolRolesAuth as any;
}
