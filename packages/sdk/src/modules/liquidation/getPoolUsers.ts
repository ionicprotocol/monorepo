// import { BigNumber, ethers } from "ethers";

// import { PoolLens } from "../../../typechain/PoolLens";
// import { IonicSdk } from "../../IonicSdk";

// import { ErroredPool, PoolUserStruct, PublicPoolUserWithData } from "./utils";

// function getUserTotals(assets: PoolLens.PoolAssetStructOutput[]): {
//   totalBorrow: BigNumber;
//   totalCollateral: BigNumber;
// } {
//   let totalBorrow = BigNumber.from(0);
//   let totalCollateral = BigNumber.from(0);

//   for (const a of assets) {
//     totalBorrow = totalBorrow.add(a.borrowBalance.mul(a.underlyingPrice).div(ethers.utils.parseEther("1")));
//     if (a.membership) {
//       totalCollateral = totalCollateral.add(
//         a.supplyBalance
//           .mul(a.underlyingPrice)
//           .div(ethers.utils.parseEther("1"))
//           .mul(a.collateralFactor)
//           .div(ethers.utils.parseEther("1"))
//       );
//     }
//   }
//   return { totalBorrow, totalCollateral };
// }

// function getPositionHealth(totalBorrow: BigNumber, totalCollateral: BigNumber): BigNumber {
//   return totalBorrow.gt(BigNumber.from(0))
//     ? totalCollateral.mul(ethers.utils.parseEther("1")).div(totalBorrow)
//     : BigNumber.from(10).pow(36);
// }

// const PAGE_SIZE = 300;

// async function getFusePoolUsers(
//   sdk: IonicSdk,
//   comptroller: string,
//   maxHealth: BigNumber
// ): Promise<PublicPoolUserWithData> {
//   const poolUsers: PoolUserStruct[] = [];
//   const comptrollerInstance = sdk.createComptroller(comptroller);
//   const borrowersCount = await comptrollerInstance.callStatic.getAllBorrowersCount();
//   const randomPage = Math.round(Math.random() * borrowersCount.div(PAGE_SIZE).toNumber());
//   const [_totalPages, users] = await comptrollerInstance.callStatic.getPaginatedBorrowers(randomPage, PAGE_SIZE);
//   for (const user of users) {
//     const assets = await sdk.contracts.PoolLens.callStatic.getPoolAssetsWithData(comptrollerInstance.address, {
//       from: user
//     });

//     const { totalBorrow, totalCollateral } = getUserTotals(assets);
//     const health = getPositionHealth(totalBorrow, totalCollateral);

//     if (maxHealth.gt(health)) {
//       poolUsers.push({ account: user, totalBorrow, totalCollateral, health });
//     }
//   }
//   return {
//     comptroller,
//     users: poolUsers,
//     closeFactor: await comptrollerInstance.callStatic.closeFactorMantissa(),
//     liquidationIncentive: await comptrollerInstance.callStatic.liquidationIncentiveMantissa()
//   };
// }

// async function getPoolsWithShortfall(sdk: IonicSdk, comptroller: string) {
//   const comptrollerInstance = sdk.createComptroller(comptroller);
//   const borrowersCount = await comptrollerInstance.callStatic.getAllBorrowersCount();
//   const randomPage = Math.round(Math.random() * borrowersCount.div(PAGE_SIZE).toNumber());
//   const [_totalPages, users] = await comptrollerInstance.callStatic.getPaginatedBorrowers(randomPage, PAGE_SIZE);
//   const promises = users.map((user) => {
//     return comptrollerInstance.callStatic.getAccountLiquidity(user);
//   });
//   const allResults = await Promise.all(promises.map((p) => p.catch((e) => e)));

//   const validResults = allResults.filter((r) => !(r instanceof Error));
//   const erroredResults = allResults.filter((r) => r instanceof Error);

//   if (erroredResults.length > 0) {
//     sdk.logger.error("Errored results", { erroredResults });
//   }
//   const results = validResults.map((r, i) => {
//     return { user: users[i], collateralValue: r[1], liquidity: r[2], shortfall: r[3] };
//   });
//   const minimumTransactionCost = await sdk.provider.getGasPrice().then((g) => g.mul(BigNumber.from(500000)));
//   return results.filter((user) => user.shortfall.gt(minimumTransactionCost));
// }

// export default async function getAllFusePoolUsers(
//   sdk: IonicSdk,
//   maxHealth: BigNumber,
//   excludedComptrollers: Array<string>
// ): Promise<[PublicPoolUserWithData[], Array<ErroredPool>]> {
//   const [, allPools] = await sdk.contracts.PoolDirectory.callStatic.getActivePools();
//   const fusePoolUsers: PublicPoolUserWithData[] = [];
//   const erroredPools: Array<ErroredPool> = [];
//   for (const pool of allPools) {
//     const { comptroller, name } = pool;
//     if (!excludedComptrollers.includes(comptroller)) {
//       try {
//         const hasShortfall = await getPoolsWithShortfall(sdk, comptroller);
//         if (hasShortfall.length > 0) {
//           const users = hasShortfall.map((user) => {
//             return `- user: ${user.user}, shortfall: ${ethers.utils.formatEther(user.shortfall)}\n`;
//           });
//           sdk.logger.info(`Pool ${name} (${comptroller}) has ${hasShortfall.length} users with shortfall: \n${users}`);
//           try {
//             const poolUserParams: PublicPoolUserWithData = await getFusePoolUsers(sdk, comptroller, maxHealth);
//             fusePoolUsers.push(poolUserParams);
//           } catch (e) {
//             const msg = `Error getting pool users for ${comptroller}` + e;
//             erroredPools.push({ comptroller, msg, error: e });
//           }
//         } else {
//           sdk.logger.info(`Pool ${name} (${comptroller}) has no users with shortfall`);
//         }
//       } catch (e) {
//         const msg = `Error getting shortfalled users for pool ${name} (${comptroller})` + e;
//         erroredPools.push({ comptroller, msg, error: e });
//       }
//     }
//   }
//   return [fusePoolUsers, erroredPools];
// }
import { BigNumber, ethers } from "ethers";
import { performance } from 'perf_hooks';

import { PoolLens } from "../../../typechain/PoolLens";
import { IonicSdk } from "../../IonicSdk";

import { ErroredPool, PoolUserStruct, PublicPoolUserWithData } from "./utils";

function getUserTotals(assets: PoolLens.PoolAssetStructOutput[]): {
  totalBorrow: BigNumber;
  totalCollateral: BigNumber;
} {
  let totalBorrow = BigNumber.from(0);
  let totalCollateral = BigNumber.from(0);

  for (const a of assets) {
    totalBorrow = totalBorrow.add(a.borrowBalance.mul(a.underlyingPrice).div(ethers.utils.parseEther("1")));
    if (a.membership) {
      totalCollateral = totalCollateral.add(
        a.supplyBalance
          .mul(a.underlyingPrice)
          .div(ethers.utils.parseEther("1"))
          .mul(a.collateralFactor)
          .div(ethers.utils.parseEther("1"))
      );
    }
  }
  return { totalBorrow, totalCollateral };
}

function getPositionHealth(totalBorrow: BigNumber, totalCollateral: BigNumber): BigNumber {
  return totalBorrow.gt(BigNumber.from(0))
    ? totalCollateral.mul(ethers.utils.parseEther("1")).div(totalBorrow)
    : BigNumber.from(10).pow(36);
}

const PAGE_SIZE = 300;

async function getFusePoolUsers(
  sdk: IonicSdk,
  comptroller: string,
  maxHealth: BigNumber
): Promise<PublicPoolUserWithData> {
  const poolUsers: PoolUserStruct[] = [];
  const comptrollerInstance = sdk.createComptroller(comptroller);
  const borrowersCount = await comptrollerInstance.callStatic.getAllBorrowersCount();
  const randomPage = Math.round(Math.random() * borrowersCount.div(PAGE_SIZE).toNumber());
  const [_totalPages, users] = await comptrollerInstance.callStatic.getPaginatedBorrowers(randomPage, PAGE_SIZE);

  const assetsPromises = users.map((user) =>
    sdk.contracts.PoolLens.callStatic.getPoolAssetsWithData(comptrollerInstance.address, { from: user })
  );

  const assetsResults = await Promise.all(assetsPromises);

  assetsResults.forEach((assets, index) => {
    const { totalBorrow, totalCollateral } = getUserTotals(assets);
    const health = getPositionHealth(totalBorrow, totalCollateral);

    if (maxHealth.gt(health)) {
      poolUsers.push({ account: users[index], totalBorrow, totalCollateral, health });
    }
  });

  return {
    comptroller,
    users: poolUsers,
    closeFactor: await comptrollerInstance.callStatic.closeFactorMantissa(),
    liquidationIncentive: await comptrollerInstance.callStatic.liquidationIncentiveMantissa()
  };
}

async function getPoolsWithShortfall(sdk: IonicSdk, comptroller: string) {
  const comptrollerInstance = sdk.createComptroller(comptroller);
  const borrowersCount = await comptrollerInstance.callStatic.getAllBorrowersCount();
  const randomPage = Math.round(Math.random() * borrowersCount.div(PAGE_SIZE).toNumber());
  const [_totalPages, users] = await comptrollerInstance.callStatic.getPaginatedBorrowers(randomPage, PAGE_SIZE);

  const liquidityPromises = users.map((user) => comptrollerInstance.callStatic.getAccountLiquidity(user));

  const liquidityResults = await Promise.all(liquidityPromises.map((p) => p.catch((e) => e)));
  const validResults = liquidityResults.filter((r) => !(r instanceof Error));
  const erroredResults = liquidityResults.filter((r) => r instanceof Error);

  if (erroredResults.length > 0) {
    sdk.logger.error("Errored results", { erroredResults });
  }

  const results = validResults.map((r, i) => {
    return { user: users[i], collateralValue: r[1], liquidity: r[2], shortfall: r[3] };
  });

  const minimumTransactionCost = await sdk.provider.getGasPrice().then((g) => g.mul(BigNumber.from(500000)));
  return results.filter((user) => user.shortfall.gt(minimumTransactionCost));
}

export default async function getAllFusePoolUsers(
  sdk: IonicSdk,
  maxHealth: BigNumber,
  excludedComptrollers: Array<string>
): Promise<[PublicPoolUserWithData[], Array<ErroredPool>]> {
  const [, allPools] = await sdk.contracts.PoolDirectory.callStatic.getActivePools();
  const fusePoolUsers: PublicPoolUserWithData[] = [];
  const erroredPools: Array<ErroredPool> = [];

  let totalUsersProcessed = 0; // Track total users processed

  const startTime = performance.now();

  const poolPromises = allPools.map(async (pool) => {
    const { comptroller, name } = pool;
    if (!excludedComptrollers.includes(comptroller)) {
      try {
        const hasShortfall = await getPoolsWithShortfall(sdk, comptroller);
        if (hasShortfall.length > 0) {
          const users = hasShortfall.map((user) => `- user: ${user.user}, shortfall: ${ethers.utils.formatEther(user.shortfall)}\n`);
          sdk.logger.info(`Pool ${name} (${comptroller}) has ${hasShortfall.length} users with shortfall: \n${users}`);
          try {
            const poolUserParams: PublicPoolUserWithData = await getFusePoolUsers(sdk, comptroller, maxHealth);
            fusePoolUsers.push(poolUserParams);
            totalUsersProcessed += poolUserParams.users.length; // Add number of users processed from this pool
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
    }
  });

  await Promise.all(poolPromises);

  const endTime = performance.now();

  console.log(`Total time taken to read all users: ${endTime - startTime} milliseconds`);
  console.log(`Total users processed: ${totalUsersProcessed}`); // Log total users processed

  return [fusePoolUsers, erroredPools];
}
