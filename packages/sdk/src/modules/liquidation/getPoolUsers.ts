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
  poolUsers: PoolUserStruct[]
) {
  const mutableUsers: `0x${string}`[] = [...users];

  for (let i = 0; i < mutableUsers.length; i += BATCH_SIZE) {
    const batchUsers = mutableUsers.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batchUsers.map(async (assets, index) => {
        try {
          const health = await sdk.contracts.PoolLens.read.getHealthFactor([batchUsers[index], comptroller]);
          if (health < maxHealth && health > HF_MIN) {
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
    await processAssetsInBatches(users, comptroller, maxHealth, sdk, poolUsers);

    page++;
  }

  return {
    comptroller,
    users: poolUsers,
    closeFactor: await comptrollerInstance.read.closeFactorMantissa(),
    liquidationIncentive: await comptrollerInstance.read.liquidationIncentiveMantissa()
  };
}

async function getPoolsWithShortfall(sdk: IonicSdk, comptroller: Address) {
  const comptrollerInstance = sdk.createComptroller(comptroller);
  let page = 0;
  let hasMoreData = true;
  let results: Array<{ user: Address; collateralValue: bigint; liquidity: bigint; shortfall: bigint }> = [];
  const erroredResults: Array<ErroredPool> = [];

  while (hasMoreData) {
    const [, users] = await comptrollerInstance.read.getPaginatedBorrowers([BigInt(page), BigInt(PAGE_SIZE)]);
    if (users.length === 0) {
      hasMoreData = false;
    }

    const promises = users.map(async (user) => {
      try {
        const liquidity = await comptrollerInstance.read.getAccountLiquidity([user]);
        return { user, collateralValue: liquidity[1], liquidity: liquidity[2], shortfall: liquidity[3] };
      } catch (error) {
        erroredResults.push({ comptroller, msg: `Error getting liquidity for ${user}: ${error}`, error });
        return null;
      }
    });

    const pageResults = await Promise.all(promises);
    results.push(
      ...pageResults.filter(
        (result): result is { user: Address; collateralValue: bigint; liquidity: bigint; shortfall: bigint } =>
          result !== null
      )
    );

    results = results.filter((user) => user.shortfall);
    page++;
  }

  if (erroredResults.length > 0) {
    sdk.logger.error("Errored results", { erroredResults });
  }

  return results;
}

export default async function getAllFusePoolUsers(
  sdk: IonicSdk,
  maxHealth: bigint,
  excludedComptrollers: Array<Address>,
  botType: BotType
): Promise<[PublicPoolUserWithData[], Array<ErroredPool>]> {
  const [, allPools] = await sdk.contracts.PoolDirectory.read.getActivePools();
  const fusePoolUsers: PublicPoolUserWithData[] = [];
  const erroredPools: Array<ErroredPool> = [];
  const startTime = performance.now();
  const poolPromises = allPools.map(async (pool) => {
    const { comptroller, name } = pool;
    if (!excludedComptrollers.includes(comptroller)) {
      const poolStartTime = performance.now();
      sdk.logger.info(`Processing pool ${name} (${comptroller})...`);
      try {
        // const hasShortfall = await getPoolsWithShortfall(sdk, comptroller);
        // if (hasShortfall.length > 0) {
        // const users = hasShortfall.map((user) => {
        //   return `- user: ${user.user}, shortfall: ${formatEther(user.shortfall)}\n`;
        // });
        // sdk.logger.info(`Pool ${name} (${comptroller}) has ${hasShortfall.length} users with shortfall: \n${users}`);
        try {
          const poolUserParams: PoolUserStruct[] = (await getFusePoolUsers(sdk, comptroller, maxHealth, botType)).users;
          const comptrollerInstance = sdk.createComptroller(comptroller); // Defined here
          fusePoolUsers.push({
            comptroller,
            users: poolUserParams,
            closeFactor: await comptrollerInstance.read.closeFactorMantissa(),
            liquidationIncentive: await comptrollerInstance.read.liquidationIncentiveMantissa()
          });
        } catch (e) {
          const msg = `Error getting pool users for ${comptroller}: ${e}`;
          erroredPools.push({ comptroller, msg, error: e });
        }
        // } else {
        //   sdk.logger.info(`Pool ${name} (${comptroller}) has no users with shortfall`);
        // }
      } catch (e) {
        const msg = `Error getting shortfalled users for pool ${name} (${comptroller}): ${e}`;
        erroredPools.push({ comptroller, msg, error: e });
      }
      const poolEndTime = performance.now();
      sdk.logger.info(
        `Processing pool ${name} (${comptroller}) took ${(poolEndTime - poolStartTime).toFixed(2)} milliseconds`
      );
    }
  });
  await Promise.all(poolPromises);
  const endTime = performance.now();
  sdk.logger.info(`Total time taken to read all users: ${(endTime - startTime).toFixed(2)} milliseconds`);
  return [fusePoolUsers, erroredPools];
}
