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
const LOG_SAMPLE = 50; // Max number of user-level logs per pool to avoid excessive verbosity
const LOG_ALL_BORROWERS = process.env.LOG_ALL_BORROWERS === "true"; // Log every borrower examined if true
const IGNORE_HF_MIN = process.env.IGNORE_HF_MIN === "true"; // If true, do not require health > HF_MIN
const HF_MIN = 500000000000000000n;
async function processAssetsInBatches(
  users: readonly `0x${string}`[],
  comptroller: Address,
  maxHealth: bigint,
  sdk: IonicSdk,
  poolUsers: PoolUserStruct[],
  botType: BotType,
  startCounter: number
) {
  const mutableUsers: `0x${string}`[] = [...users];
  // console.log("BotTypefromGetPOOlUsers", botType)
  const healthFactorThreshold = await sdk.contracts.IonicLiquidator.read.healthFactorThreshold();
  // console.log("healthFactorThreshold", healthFactorThreshold)
  let logged = 0;
  let examined = startCounter;
  for (let i = 0; i < mutableUsers.length; i += BATCH_SIZE) {
    const batchUsers = mutableUsers.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batchUsers.map(async (assets, index) => {
        examined++;
        try {
          const health = await sdk.contracts.PoolLens.read.getHealthFactor([batchUsers[index], comptroller]);
          const aboveMin = IGNORE_HF_MIN ? true : health > HF_MIN;
          const qualifiesPyth = aboveMin && health < maxHealth && botType === BotType.Pyth;
          const qualifiesStd = aboveMin && health < healthFactorThreshold && botType == BotType.Standard;
          if (LOG_ALL_BORROWERS || logged < LOG_SAMPLE) {
            sdk.logger.info(
              `[${examined}] Examined borrower ${batchUsers[index]} on ${comptroller} | health=${health.toString()} | qualifies=${
                qualifiesPyth || qualifiesStd
              }`
            );
            if (!LOG_ALL_BORROWERS) logged++;
          }
          if (qualifiesPyth) {
            // console.log("I am in pyth loop")
            poolUsers.push({ account: batchUsers[index], health });
          } else if (qualifiesStd) {
            // console.log("I am in standard loop, ")
            poolUsers.push({ account: batchUsers[index], health });
          }
        } catch (error) {
          sdk.logger.error(`Error getting health factor for ${batchUsers[index]}: ${error}`);
        }
      })
    );
  }
  sdk.logger.info(`Processed ${examined - startCounter} borrowers in batch for comptroller ${comptroller}`);
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
  let examined = 0;

  while (hasMoreData) {
    const [, users] = await comptrollerInstance.read.getPaginatedBorrowers([BigInt(page), BigInt(PAGE_SIZE)]);
    if (users.length === 0) {
      hasMoreData = false;
    }
    sdk.logger.info(
      `Borrowers page ${page} for comptroller ${comptroller}: count=${users.length} (pageSize=${PAGE_SIZE})`
    );
    if (users.length > 0) {
      const sample = users.slice(0, Math.min(users.length, 20));
      sdk.logger.info(`First ${sample.length} borrowers on page ${page}: ${sample.join(", ")}`);
    }
    // Process assets in batches
    await processAssetsInBatches(users, comptroller, maxHealth, sdk, poolUsers, botType, examined);
    examined += users.length;

    page++;
  }

  sdk.logger.info(
    `Finished examining ${examined} borrowers for comptroller ${comptroller}; qualified=${poolUsers.length}`
  );

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
  sdk.logger.info(`PoolDirectory active pools: ${allPools.length}`);
  if (allPools.length > 0) {
    const samplePools = allPools.slice(0, 10).map((p) => `${p.name}(${p.comptroller})`);
    sdk.logger.info(
      `First ${samplePools.length} pools: ${samplePools.join(", ")}${
        allPools.length > samplePools.length ? ` ... (+${allPools.length - samplePools.length} more)` : ""
      }`
    );
  }
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
        if (userCount > 0) {
          const sampleUsers = poolUserParams.slice(0, Math.min(userCount, 20));
          sdk.logger.info(
            `Users considered in ${name} (${comptroller}): ${sampleUsers
              .map((u) => `${u.account}:${u.health.toString()}`)
              .join(", ")}${userCount > sampleUsers.length ? ` ... (+${userCount - sampleUsers.length} more)` : ""}`
          );
        }
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
