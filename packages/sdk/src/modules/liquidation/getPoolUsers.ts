import { Performance } from "perf_hooks";
import { Address, formatEther, parseEther } from "viem";
import { IonicSdk } from "../../IonicSdk";

let performance: Performance;

if (typeof window === "undefined") {
  import("perf_hooks")
    .then(({ performance: nodePerformance }) => {
      performance = nodePerformance;
    })
    .catch((err) => {
      console.error("Failed to load perf_hooks:", err);
    });
} else {
  performance = window.performance as any;
}

import { ErroredPool, PoolUserStruct, PublicPoolUserWithData } from "./utils";

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
  supplyBalance: bigint;  // Example property
  borrowBalance: bigint;  // Example property
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


function getUserTotals(assets: PoolAssetStructOutput[]): {
  totalBorrow: bigint;
  totalCollateral: bigint;
} {
  let totalBorrow = 0n;
  let totalCollateral = 0n;

  for (const a of assets) {
    // Ensure all operations are done with bigint
    const borrowBalanceBigInt = BigInt(a.borrowBalance);
    const underlyingPriceBigInt = BigInt(a.underlyingPrice);
    const supplyBalanceBigInt = BigInt(a.supplyBalance);
    const collateralFactorBigInt = BigInt(a.collateralFactor);

    // Calculate total borrow using bigint arithmetic
    totalBorrow += (borrowBalanceBigInt * underlyingPriceBigInt) / parseEther("1");

    if (a.membership) {
      totalCollateral +=
        (((supplyBalanceBigInt * underlyingPriceBigInt) / parseEther("1")) * collateralFactorBigInt) /
        parseEther("1");
    }
  }
  return { totalBorrow, totalCollateral };
}



function getPositionHealth(totalBorrow: bigint, totalCollateral: bigint): bigint {
  return totalBorrow > 0n ? (totalCollateral * parseEther("1")) / totalBorrow : 10n ** 36n;
}

const PAGE_SIZE = 300;

async function getFusePoolUsers(
  sdk: IonicSdk,
  comptroller: Address,
  maxHealth: bigint
): Promise<PublicPoolUserWithData> {
  const poolUsers: PoolUserStruct[] = [];
  const comptrollerInstance = sdk.createComptroller(comptroller);
  const borrowersCount = await comptrollerInstance.read.getAllBorrowersCount();
  const totalPages = Math.ceil(Number(borrowersCount) / PAGE_SIZE);

  const fetchUsersFromPage = async (page: number) => {
    const [, users] = await comptrollerInstance.read.getPaginatedBorrowers([BigInt(page), BigInt(PAGE_SIZE)]);
    const assetsResults = await Promise.all(
      users.map(async (user) => {
        const assets = (
          await sdk.contracts.PoolLens.simulate.getPoolAssetsWithData([comptrollerInstance.address], { account: user })
        ).result;
        return assets;
      })
    );
    assetsResults.forEach((assets, index) => {
      const { totalBorrow, totalCollateral } = getUserTotals(assets as PoolAssetStructOutput[]);
      const health = getPositionHealth(totalBorrow, totalCollateral);

      if (maxHealth > health) {
        poolUsers.push({ account: users[index], totalBorrow, totalCollateral, health });
      }
    });
  };

  const pagePromises = Array.from({ length: totalPages }, (_, i) => fetchUsersFromPage(i + 1));
  await Promise.all(pagePromises);

  return {
    comptroller,
    users: poolUsers,
    closeFactor: await comptrollerInstance.read.closeFactorMantissa(),
    liquidationIncentive: await comptrollerInstance.read.liquidationIncentiveMantissa(),
  };
}

async function getPoolsWithShortfall(sdk: IonicSdk, comptroller: Address) {
  const comptrollerInstance = sdk.createComptroller(comptroller);
  const borrowersCount = await comptrollerInstance.read.getAllBorrowersCount();
  const totalPages = Math.ceil(Number(borrowersCount) / PAGE_SIZE);

  const fetchLiquidityFromPage = async (page: number) => {
    const [, users] = await comptrollerInstance.read.getPaginatedBorrowers([BigInt(page), BigInt(PAGE_SIZE)]);
    const promises = users.map((user) => comptrollerInstance.read.getAccountLiquidity([user]));
    const allResults = await Promise.all(promises.map((p) => p.catch((e) => e)));

    return allResults.map((result, i) => {
      return {
        user: users[i],
        collateralValue: result[1],
        liquidity: result[2],
        shortfall: result[3],
      };
    });
  };

  const pagePromises = Array.from({ length: totalPages }, (_, i) => fetchLiquidityFromPage(i + 1));
  const allResults = await Promise.all(pagePromises);
  const results = allResults.flat();

  const minimumTransactionCost = await sdk.publicClient.getGasPrice().then((g) => g * 500000n);
  return results.filter((user) => user.shortfall > minimumTransactionCost);
}

export default async function getAllFusePoolUsers(
  sdk: IonicSdk,
  maxHealth: bigint,
  excludedComptrollers: Array<Address>
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
            const poolUserParams: PoolUserStruct[] = (await getFusePoolUsers(sdk, comptroller, maxHealth)).users;
            const comptrollerInstance = sdk.createComptroller(comptroller);
            fusePoolUsers.push({
              comptroller,
              users: poolUserParams,
              closeFactor: await comptrollerInstance.read.closeFactorMantissa(),
              liquidationIncentive: await comptrollerInstance.read.liquidationIncentiveMantissa(),
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
