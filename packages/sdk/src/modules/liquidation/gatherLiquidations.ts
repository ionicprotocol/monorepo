import { BigNumber } from "ethers";

import { IonicSdk } from "../../IonicSdk";

import { ChainLiquidationConfig } from "./config";
import {
  EncodedLiquidationTx,
  ErroredPool,
  LiquidatablePool,
  PoolUserStruct,
  PoolUserWithAssets,
  PublicPoolUserWithData,
} from "./utils";

import { getPotentialLiquidation } from "./index";

async function getLiquidatableUsers(
  sdk: IonicSdk,
  poolUsers: PoolUserStruct[],
  pool: PublicPoolUserWithData,
  chainLiquidationConfig: ChainLiquidationConfig
): Promise<Array<EncodedLiquidationTx>> {
  const users: Array<EncodedLiquidationTx> = [];
  for (const user of poolUsers) {
    const userAssets = await sdk.contracts.PoolLens.callStatic.getPoolAssetsByUser(pool.comptroller, user.account);
    const userWithAssets: PoolUserWithAssets = {
      ...user,
      debt: [],
      collateral: [],
      assets: userAssets,
    };

    const encodedLiquidationTX = await getPotentialLiquidation(
      sdk,
      userWithAssets,
      pool.closeFactor,
      pool.liquidationIncentive,
      chainLiquidationConfig
    );
    if (encodedLiquidationTX !== null) users.push(encodedLiquidationTX);
  }
  return users;
}

export default async function gatherLiquidations(
  sdk: IonicSdk,
  pools: Array<PublicPoolUserWithData>,
  chainLiquidationConfig: ChainLiquidationConfig
): Promise<[Array<LiquidatablePool>, Array<ErroredPool>]> {
  const liquidations: Array<LiquidatablePool> = [];
  const erroredPools: Array<ErroredPool> = [];

  for (const pool of pools) {
    const poolUsers = pool.users.slice().sort((a, b) => {
      const right = BigNumber.from(b.totalBorrow);
      const left = BigNumber.from(a.totalBorrow);
      if (right.gt(left)) return 1;
      if (right.lt(left)) return -1;
      return 0;
    });
    try {
      const liquidatableUsers = await getLiquidatableUsers(sdk, poolUsers, pool, chainLiquidationConfig);
      if (liquidatableUsers.length > 0) {
        liquidations.push({
          comptroller: pool.comptroller,
          liquidations: liquidatableUsers,
        });
      }
    } catch (e) {
      erroredPools.push({
        msg: "Error while fetching liquidatable users " + (e as Error).stack,
        comptroller: pool.comptroller,
        error: e,
      });
    }
  }
  return [liquidations, erroredPools];
}
