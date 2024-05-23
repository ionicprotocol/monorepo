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
  PythEncodedLiquidationTx,
  PythLiquidatablePool,
  BotType
} from "./utils";

import { getPotentialLiquidation, getPotentialPythLiquidation } from "./index";

async function getLiquidatableUsers<T extends LiquidatablePool | PythLiquidatablePool>(
  sdk: IonicSdk,
  poolUsers: PoolUserStruct[],
  pool: PublicPoolUserWithData,
  chainLiquidationConfig: ChainLiquidationConfig,
  botType: BotType
): Promise<Array<T>> {
  const users: Array<T> = [];
  for (const user of poolUsers) {
    const userAssets = await sdk.contracts.PoolLens.callStatic.getPoolAssetsByUser(pool.comptroller, user.account);
    const userWithAssets: PoolUserWithAssets = {
      ...user,
      debt: [],
      collateral: [],
      assets: userAssets
    };

    let encodedLiquidationTX;

    if (botType == BotType.Standard) {
      encodedLiquidationTX = await getPotentialLiquidation(
        sdk,
        userWithAssets,
        pool.closeFactor,
        pool.liquidationIncentive,
        chainLiquidationConfig
      );
    } else {
      encodedLiquidationTX = await getPotentialPythLiquidation(
        sdk,
        userWithAssets,
        pool.closeFactor,
        pool.liquidationIncentive,
        chainLiquidationConfig
      );
    }
    if (encodedLiquidationTX !== null) users.push(encodedLiquidationTX as T);
  }
  return users;
}

export default async function gatherLiquidations<T extends LiquidatablePool | PythLiquidatablePool>(
  sdk: IonicSdk,
  pools: Array<PublicPoolUserWithData>,
  chainLiquidationConfig: ChainLiquidationConfig,
  botType: BotType
): Promise<[Array<T>, Array<ErroredPool>]> {
  const liquidations: Array<T> = [];
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
      const liquidatableUsers = await getLiquidatableUsers<T>(sdk, poolUsers, pool, chainLiquidationConfig, botType);
      if (liquidatableUsers.length > 0) {
        liquidations.push({
          comptroller: pool.comptroller,
          liquidations: liquidatableUsers
        } as unknown as T);
      }
    } catch (e) {
      erroredPools.push({
        msg: "Error while fetching liquidatable users " + (e as Error).stack,
        comptroller: pool.comptroller,
        error: e
      });
    }
  }
  return [liquidations, erroredPools];
}
