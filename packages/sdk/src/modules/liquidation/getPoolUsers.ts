import pLimit from 'p-limit';
import { Address, formatEther } from 'viem';
import { IonicSdk } from "../../IonicSdk";
import { BotType, ErroredPool, PoolUserStruct, PublicPoolUserWithData } from "./utils";

// Constants
const CONCURRENCY_LIMIT = 50; // Adjust concurrency limit based on system capacity
const BATCH_SIZE = 20; // Process users in batches
const PAGE_SIZE = 1000; // Define the page size for pagination

// Initialize p-limit with the specified concurrency limit
const limit = pLimit(CONCURRENCY_LIMIT);

// Function to process assets in batches
async function processAssetsInBatches(
  assetsResults: any[], // Replace `any` with actual type if available
  users: readonly `0x${string}`[],
  poolUsers: PoolUserStruct[]
): Promise<void> {
  const batchPromises: Array<Promise<void>> = [];

  for (let i = 0; i < assetsResults.length; i += BATCH_SIZE) {
    const batch = assetsResults.slice(i, i + BATCH_SIZE);
    const batchUsers = users.slice(i, i + BATCH_SIZE);

    // Explicitly specify the type of function passed to limit
    batchPromises.push(
      limit(async (): Promise<void> => {
        for (let j = 0; j < batch.length; j++) {
          const user = batchUsers[j];
          poolUsers.push({ account: user, health: 0n });
        }
      })
    );
  }

  await Promise.all(batchPromises);
}

// Function to get users from the Fuse pool
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
    } else {
      const assetsResults = await Promise.all(
        users.map(async (user) => {
          const assets = (
            await sdk.contracts.PoolLens.simulate.getPoolAssetsWithData([comptrollerInstance.address], { account: user })
          ).result;
          return assets;
        })
      );

      const hfThreshold = await sdk.contracts.IonicLiquidator.read.healthFactorThreshold();

      // Process assets in batches
      await processAssetsInBatches(assetsResults, users, poolUsers);

      page++;
    }
  }

  return {
    comptroller,
    users: poolUsers,
    closeFactor: await comptrollerInstance.read.closeFactorMantissa(),
    liquidationIncentive: await comptrollerInstance.read.liquidationIncentiveMantissa()
  };
}

// Function to get pools with shortfall
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
    } else {
      const pageResults = await Promise.all(
        users.map(async (user) => {
          try {
            const liquidity = await comptrollerInstance.read.getAccountLiquidity([user]);
            return { user, collateralValue: liquidity[1], liquidity: liquidity[2], shortfall: liquidity[3] };
          } catch (error) {
            erroredResults.push({ comptroller, msg: `Error getting liquidity for ${user}: ${error}`, error });
            return null;
          }
        })
      );

      results.push(...pageResults.filter((result): result is { user: Address; collateralValue: bigint; liquidity: bigint; shortfall: bigint } => result !== null));

      // Filter results with shortfall
      results = results.filter(user => user.shortfall);
      page++;
    }
  }

  if (erroredResults.length > 0) {
    sdk.logger.error("Errored results", { erroredResults });
  }

  return results;
}

// Main function to get all Fuse pool users
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
        const hasShortfall = await getPoolsWithShortfall(sdk, comptroller);
        if (hasShortfall.length > 0) {
          const users = hasShortfall.map(user => `- user: ${user.user}, shortfall: ${formatEther(user.shortfall)}\n`);
          sdk.logger.info(`Pool ${name} (${comptroller}) has ${hasShortfall.length} users with shortfall: \n${users}`);
          try {
            const poolUserParams = (await getFusePoolUsers(sdk, comptroller, maxHealth, botType)).users;
            const comptrollerInstance = sdk.createComptroller(comptroller);
            fusePoolUsers.push({
              comptroller,
              users: poolUserParams,
              closeFactor: await comptrollerInstance.read.closeFactorMantissa(),
              liquidationIncentive: await comptrollerInstance.read.liquidationIncentiveMantissa()
            });
          } catch (e) {
            erroredPools.push({ comptroller, msg: `Error getting pool users for ${comptroller}: ${e}`, error: e });
          }
        } else {
          sdk.logger.info(`Pool ${name} (${comptroller}) has no users with shortfall`);
        }
      } catch (e) {
        erroredPools.push({ comptroller, msg: `Error getting shortfalled users for pool ${name} (${comptroller}): ${e}`, error: e });
      }
      const poolEndTime = performance.now();
      sdk.logger.info(`Processing pool ${name} (${comptroller}) took ${(poolEndTime - poolStartTime).toFixed(2)} milliseconds`);
    }
  });

  await Promise.all(poolPromises);
  const endTime = performance.now();
  sdk.logger.info(`Total time taken to read all users: ${(endTime - startTime).toFixed(2)} milliseconds`);
  
  return [fusePoolUsers, erroredPools];
}
