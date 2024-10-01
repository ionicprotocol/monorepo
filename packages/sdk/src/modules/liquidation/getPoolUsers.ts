import { Performance } from "perf_hooks";

import { Address, formatEther, parseEther } from "viem";

import { IonicSdk } from "../../IonicSdk";

import { BotType, ErroredPool, PoolUserStruct, PublicPoolUserWithData } from "./utils";

let performance: Performance;
if (typeof window === "undefined") {
  // Running in Node.js environment
  import("perf_hooks")
    .then(({ performance: nodePerformance }) => {
      performance = nodePerformance;
    })
    .catch((err) => {
      console.error("Failed to load perf_hooks:", err);
      // Handle error as needed
    });
} else {
  // Running in browser environment
  performance = window.performance as any;
}

export type PoolAssetStructOutput = {
  cToken: Address;
  underlyingToken: Address;
  underlyingName: string;
  underlyingSymbol: string;
  underlyingDecimals: bigint;
  underlyingBalance: bigint;
  supplyRatePerBlock: bigint;
  borrowRatePerBlock: bigint;
  totalSupply: bigint;
  totalBorrow: bigint;
  supplyBalance: bigint;
  borrowBalance: bigint;
  liquidity: bigint;
  membership: boolean;
  exchangeRate: bigint;
  underlyingPrice: bigint;
  oracle: Address;
  collateralFactor: bigint;
  reserveFactor: bigint;
  adminFee: bigint;
  ionicFee: bigint;
  borrowGuardianPaused: boolean;
  mintGuardianPaused: boolean;
};

const PAGE_SIZE = 500; // Define the page size for pagination
const BATCH_SIZE = 100; // Define the batch size for processing assets
const HF_MIN = 500000000000000000n;
async function processAssetsInBatches(
  users: readonly `0x${string}`[],
  comptroller: Address,
  maxHealth: bigint,
  sdk: IonicSdk,
  poolUsers: PoolUserStruct[],
  botType: BotType
) {
  const mutableUsers: `0x${string}`[] = [...users];
  // console.log("BotTypefromGetPOOlUsers", botType)
  const healthFactorThreshold = await sdk.contracts.IonicLiquidator.read.healthFactorThreshold({blockNumber:13764552n});
  // console.log("healthFactorThreshold", healthFactorThreshold)
  for (let i = 0; i < mutableUsers.length; i += BATCH_SIZE) {
    const batchUsers = mutableUsers.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batchUsers.map(async (assets, index) => {
        try {
          const health = await sdk.contracts.PoolLens.read.getHealthFactor([batchUsers[index], comptroller], {blockNumber:13764552n});
          if (health < maxHealth && health > HF_MIN && botType === BotType.Pyth) {
            // console.log("I am in pyth loop")
            poolUsers.push({ account: batchUsers[index], health });
          } else if (health < healthFactorThreshold && health > HF_MIN && botType == BotType.Standard) {
            // console.log("I am in standard loop, ")
            poolUsers.push({ account: batchUsers[index], health });
          }
        } catch (error) {
          sdk.logger.error(`Error getting health factor for ${batchUsers[index]}: ${error}`);
        }
      })
    );
  }
}

async function getFusePoolUsers(
  sdk: IonicSdk,
  comptroller: Address,
  maxHealth: bigint,
  botType: BotType
): Promise<PublicPoolUserWithData> {
  const poolUsers: PoolUserStruct[] = [];
  const comptrollerInstance = sdk.createComptroller(comptroller);
  let page = 0;
  let hasMoreData = true;

  while (hasMoreData) {
    const [, users] = await comptrollerInstance.read.getPaginatedBorrowers([BigInt(page), BigInt(PAGE_SIZE)]);
    if (users.length === 0) {
      hasMoreData = false;
    }

    // Process assets in batches
    await processAssetsInBatches(users, comptroller, maxHealth, sdk, poolUsers, botType);

    page++;
  }

  return {
    comptroller,
    users: poolUsers,
    closeFactor: await comptrollerInstance.read.closeFactorMantissa(),
    liquidationIncentive: await comptrollerInstance.read.liquidationIncentiveMantissa()
  };
}

export default async function getAllFusePoolUsers(
  sdk: IonicSdk,
  maxHealth: bigint,
  excludedComptrollers: Array<Address>,
  botType: BotType
): Promise<[PublicPoolUserWithData[], Array<ErroredPool>]> {
  const [, allPools] = await sdk.contracts.PoolDirectory.read.getActivePools();
  // const filteredPools = allPools.filter(pool => pool.name === "Mode Native Market");
  const fusePoolUsers: PublicPoolUserWithData[] = [];
  const erroredPools: Array<ErroredPool> = [];
  const startTime = performance.now();
  const poolPromises = allPools.map(async (pool) => {
    const { comptroller, name } = pool;
    let userCount;
    if (!excludedComptrollers.includes(comptroller)) {
      const poolStartTime = performance.now();
      sdk.logger.info(`Processing pool ${name} (${comptroller})...`);
      try {
        const poolUserParams: PoolUserStruct[] = (await getFusePoolUsers(sdk, comptroller, maxHealth, botType)).users;
        const comptrollerInstance = sdk.createComptroller(comptroller); // Defined here
        fusePoolUsers.push({
          comptroller,
          users: poolUserParams,
          closeFactor: await comptrollerInstance.read.closeFactorMantissa(),
          liquidationIncentive: await comptrollerInstance.read.liquidationIncentiveMantissa()
        });
        userCount = poolUserParams.length;
      } catch (e) {
        const msg = `Error getting pool users for ${comptroller}: ${e}`;
        erroredPools.push({ comptroller, msg, error: e });
      }
      const poolEndTime = performance.now();
      sdk.logger.info(
        `Processing pool ${name} (${comptroller}) took ${(poolEndTime - poolStartTime).toFixed(2)} milliseconds, ${userCount} users in shortfall`
      );
    }
  });
  await Promise.all(poolPromises);
  const endTime = performance.now();
  sdk.logger.info(`Total time taken to read all users: ${(endTime - startTime).toFixed(2)} milliseconds`);
  return [fusePoolUsers, erroredPools];
}
