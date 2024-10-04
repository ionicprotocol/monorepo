import { task, types } from "hardhat/config";
import {
  parseUnits,
  parseEther,
  encodeAbiParameters,
  parseAbiParameters,
  keccak256,
  getContractAddress,
  Hex,
  encodePacked
} from "viem";

import { Address } from "viem";
import { unitrollerBytecode } from "./constants";

task("pool:create:mode").setAction(async ({}, { run }) => {
  await run("pool:create", {
    name: "Mode Market",
    creator: "deployer",
    priceOracle: "0x2BAF3A2B667A5027a83101d218A9e8B73577F117", // MPO
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false"
  });
});

task("pool:create:modenative").setAction(async ({}, { run }) => {
  await run("pool:create", {
    name: "Mode Native Market",
    creator: "deployer",
    priceOracle: "0x2BAF3A2B667A5027a83101d218A9e8B73577F117", // MPO
    closeFactor: "55",
    liquidationIncentive: "17",
    enforceWhitelist: "false"
  });
});

task("pool:create:base").setAction(async ({}, { run }) => {
  await run("pool:create", {
    name: "Base Market",
    creator: "deployer",
    priceOracle: "0x1D89E5ba287E67AC0046D2218Be5fE1382cE47b4", // MPO
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false"
  });
});

task("pool:create:optimism-main").setAction(async ({}, { run, deployments }) => {
  const mpo = await deployments.get("MasterPriceOracle");
  await run("pool:create", {
    name: "Optimism Main Market",
    creator: "deployer",
    priceOracle: mpo.address, // MPO
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false"
  });
});

task("pool:create:bob:main").setAction(async ({}, { run, deployments }) => {
  const mpo = await deployments.get("MasterPriceOracle");
  await run("pool:create", {
    name: "BoB Main Market",
    creator: "deployer",
    priceOracle: mpo.address, // MPO
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false"
  });
});

task("pool:create", "Create pool if does not exist")
  .addParam("name", "Name of the pool to be created", undefined, types.string)
  .addParam("creator", "Named account from which to create the pool", "deployer", types.string)
  .addParam("priceOracle", "Which price oracle to use", undefined, types.string)
  .addParam("closeFactor", "Close factor in full percent (50% = 50)", undefined, types.string)
  .addParam("liquidationIncentive", "Liquidation incentive in full percent (8% = 8)", undefined, types.string)
  .addParam("enforceWhitelist", "Whitelist enabled?", undefined, types.string)
  .addOptionalParam("whitelist", "whitelist as comma separated input (address1,address2...)", undefined, types.string)
  .setAction(async (taskArgs, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const whitelist = taskArgs.whitelist ? taskArgs.whitelist.split(",") : [];
    if (taskArgs.enforceWhitelist === "true" && whitelist.length === 0) {
      throw "If enforcing whitelist, a whitelist array of addresses must be provided";
    }

    const poolLens = await viem.getContractAt("PoolLens", (await deployments.get("PoolLens")).address as Address);
    const pools = await poolLens.simulate.getPublicPoolsWithData();
    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );
    for (const [, name] of pools.result) {
      if (name === taskArgs.name) {
        throw "Pool already exists";
      }
    }
    const feeDistributorAddress = (await deployments.get("FeeDistributor")).address as Address;

    const deployTx = await poolDirectory.write.deployPool([
      taskArgs.name as string,
      (await deployments.get("Comptroller")).address as Address,
      encodeAbiParameters(parseAbiParameters("address"), [feeDistributorAddress]),
      taskArgs.enforceWhitelist === "true",
      parseUnits(taskArgs.closeFactor, 16),
      parseEther((Number(taskArgs.liquidationIncentive) / 100 + 1).toString()),
      taskArgs.priceOracle as Address
    ]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: deployTx });
    const [event] = await poolDirectory.getEvents.PoolRegistered({ blockHash: receipt.blockHash });
    console.log(`Pool registered: ${event}`);
    if (!event) {
      throw "Pool not found";
    }

    // Compute Unitroller address
    const poolAddress = event.args.pool?.comptroller;
    if (!poolAddress) {
      throw "Pool address not found";
    }

    const unitroller = await viem.getContractAt("Unitroller", poolAddress);
    const acceptTx = await unitroller.write._acceptAdmin();
    const acceptReceipt = await publicClient.waitForTransactionReceipt({ hash: acceptTx });
    console.log(`Pool ${taskArgs.name} created at ${poolAddress}, accept status: ${acceptReceipt.status}`);

    if (taskArgs.enforceWhitelist) {
      const comptroller = await viem.getContractAt("IonicComptroller", poolAddress);

      // Was enforced by pool deployment, now just add addresses
      const whitelistTx = await comptroller.write._setWhitelistStatuses([
        whitelist,
        Array(whitelist.length).fill(true)
      ]);
      const whitelistReceipt = await publicClient.waitForTransactionReceipt({ hash: whitelistTx });
      console.log(`Whitelist updated: ${whitelistReceipt.status}`);
    }

    return poolAddress;
  });
