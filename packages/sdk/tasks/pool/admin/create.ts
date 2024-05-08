import { parseEther, parseUnits } from "ethers/lib/utils";
import { task, types } from "hardhat/config";

import { getPoolByName, logPoolData } from "../utils";

task("pool:create:chapel").setAction(async ({}, { run, ethers }) => {
  await run("pool:create", {
    name: "IONIC Test BOMB Pool",
    creator: "deployer",
    priceOracle: "0xc625139B9471432Abea0F9f97A84611BCDC4cbdD", // MPO
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false"
  });
});

task("pool:create:mode").setAction(async ({}, { run, ethers }) => {
  await run("pool:create", {
    name: "Mode Market",
    creator: "deployer",
    priceOracle: "0x2BAF3A2B667A5027a83101d218A9e8B73577F117", // MPO
    closeFactor: "50",
    liquidationIncentive: "8",
    enforceWhitelist: "false"
  });
});

task("pool:create:modenative").setAction(async ({}, { run, ethers }) => {
  await run("pool:create", {
    name: "Mode Native Market",
    creator: "deployer",
    priceOracle: "0x2BAF3A2B667A5027a83101d218A9e8B73577F117", // MPO
    closeFactor: "55",
    liquidationIncentive: "17",
    enforceWhitelist: "false"
  });
});

// update the MPO=0x429041250873643235cb3788871447c6fF3205aA
// npx hardhat pool:create --name Test --creator deployer --price-oracle $MPO --close-factor 50 --liquidation-incentive 8 --enforce-whitelist false --network localhost

task("pool:create", "Create pool if does not exist")
  .addParam("name", "Name of the pool to be created", undefined, types.string)
  .addParam("creator", "Named account from which to create the pool", "deployer", types.string)
  .addParam("priceOracle", "Which price oracle to use", undefined, types.string)
  .addParam("closeFactor", "Close factor in full percent (50% = 50)", undefined, types.string)
  .addParam("liquidationIncentive", "Liquidation incentive in full percent (8% = 8)", undefined, types.string)
  .addParam("enforceWhitelist", "Whitelist enabled?", undefined, types.string)
  .addOptionalParam("whitelist", "whitelist as comma separated input (address1,address2...)", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const signer = await hre.ethers.getNamedSigner(taskArgs.creator);

    const ionicSdkModule = await import("../../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(signer);
    const whitelist = taskArgs.whitelist ? taskArgs.whitelist.split(",") : [];
    if (taskArgs.enforceWhitelist === "true" && whitelist.length === 0) {
      throw "If enforcing whitelist, a whitelist array of addresses must be provided";
    }

    if (await getPoolByName(taskArgs.name, sdk)) {
      throw "Pool already exists";
    }

    const [poolAddress, implementationAddress, priceOracle, poolId] = await sdk.deployPool(
      taskArgs.name,
      taskArgs.enforceWhitelist === "true",
      parseUnits(taskArgs.closeFactor, 16),
      parseEther((Number(taskArgs.liquidationIncentive) / 100 + 1).toString()),
      taskArgs.priceOracle,
      whitelist
    );

    await logPoolData(poolAddress, sdk);
    return poolAddress;
  });
