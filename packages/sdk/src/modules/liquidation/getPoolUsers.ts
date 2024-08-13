import { Performance } from "perf_hooks";

import { Address, formatEther, parseEther } from "viem";

import { IonicSdk } from "../../IonicSdk";

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
import { BotType, ErroredPool, PoolUserStruct, PublicPoolUserWithData } from "./utils";
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

const PAGE_SIZE = 1000;
async function getFusePoolUsers(
  sdk: IonicSdk,
  comptroller: Address,
  maxHealth: bigint,
  botType: BotType
): Promise<PublicPoolUserWithData> {
  const poolUsers: PoolUserStruct[] = [];
  const comptrollerInstance = sdk.createComptroller(comptroller);
  const borrowersCount = await comptrollerInstance.read.getAllBorrowersCount();
  const randomPage = Math.round((Math.random() * Number(borrowersCount)) / PAGE_SIZE);
  const [, users] = await comptrollerInstance.read.getPaginatedBorrowers([BigInt(randomPage), BigInt(PAGE_SIZE)]);
  const assetsResults = await Promise.all(
    users.map(async (user) => {
      const assets = (
        await sdk.contracts.PoolLens.simulate.getPoolAssetsWithData([comptrollerInstance.address], { account: user })
      ).result;
      return assets;
    })
  );
  assetsResults.forEach(async (assets, index) => {
    const health = await sdk.contracts.PoolLens.read.getHealthFactor([users[index], comptroller]);
    const hfThreshold = await sdk.contracts.IonicLiquidator.read.healthFactorThreshold();
    if (health < maxHealth && (botType !== BotType.Pyth || (botType === BotType.Pyth && health > hfThreshold))) {
      sdk.logger.info(`${users[index]} health is ${formatEther(health)}`);
      poolUsers.push({ account: users[index], health });
    }
  });
  return {
    comptroller,
    users: poolUsers,
    closeFactor: await comptrollerInstance.read.closeFactorMantissa(),
    liquidationIncentive: await comptrollerInstance.read.liquidationIncentiveMantissa()
  };
}
async function getPoolsWithShortfall(sdk: IonicSdk, comptroller: Address) {
  const comptrollerInstance = sdk.createComptroller(comptroller);
  const borrowersCount = await comptrollerInstance.read.getAllBorrowersCount();
  const randomPage = Math.round((Math.random() * Number(borrowersCount)) / PAGE_SIZE);
  const [, users] = await comptrollerInstance.read.getPaginatedBorrowers([BigInt(randomPage), BigInt(PAGE_SIZE)]);
  const promises = users.map((user) => {
    return comptrollerInstance.read.getAccountLiquidity([user]);
  });
  const allResults = await Promise.all(promises.map((p) => p.catch((e) => e)));
  const validResults = allResults.filter((r) => !(r instanceof Error));
  const erroredResults = allResults.filter((r) => r instanceof Error);
  if (erroredResults.length > 0) {
    sdk.logger.error("Errored results", { erroredResults });
  }
  const results = validResults.map((r, i) => {
    return { user: users[i], collateralValue: r[1], liquidity: r[2], shortfall: r[3] };
  });
  const minimumTransactionCost = await sdk.publicClient.getGasPrice().then((g) => g * 500000n);
  return results.filter((user) => user.shortfall > minimumTransactionCost);
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
        const hasShortfall = await getPoolsWithShortfall(sdk, comptroller);
        if (hasShortfall.length > 0) {
          const users = hasShortfall.map((user) => {
            return `- user: ${user.user}, shortfall: ${formatEther(user.shortfall)}\n`;
          });
          sdk.logger.info(`Pool ${name} (${comptroller}) has ${hasShortfall.length} users with shortfall: \n${users}`);
          try {
            const poolUserParams: PoolUserStruct[] = (await getFusePoolUsers(sdk, comptroller, maxHealth, botType))
              .users;
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
        } else {
          sdk.logger.info(`Pool ${name} (${comptroller}) has no users with shortfall`);
        }
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
  // console.log(`Total users processed: ${fusePoolUsers.reduce((sum, pool) => sum + pool.users.length, 0)}`);
  return [fusePoolUsers, erroredPools];
}
