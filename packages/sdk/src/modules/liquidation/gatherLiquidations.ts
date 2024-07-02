import { IonicSdk } from "../../IonicSdk";

import { ChainLiquidationConfig } from "./config";
import {
  EncodedLiquidationTx,
  ErroredPool,
  LiquidatablePool,
  PoolUserStruct,
  PoolUserWithAssets,
  PublicPoolUserWithData,
  ExtendedPoolAssetStructOutput
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
    const userAssets = (await sdk.contracts.PoolLens.simulate.getPoolAssetsByUser([pool.comptroller, user.account]))
      .result;
    const userWithAssets: PoolUserWithAssets = {
      ...user,
      debt: [],
      collateral: [],
      assets: userAssets as ExtendedPoolAssetStructOutput[]
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
      const right = b.totalBorrow;
      const left = a.totalBorrow;
      if (right > left) return 1;
      if (right < left) return -1;
      return 0;
    });
    try {
      const liquidatableUsers = await getLiquidatableUsers(sdk, poolUsers, pool, chainLiquidationConfig);
      if (liquidatableUsers.length > 0) {
        liquidations.push({
          comptroller: pool.comptroller,
          liquidations: liquidatableUsers
        });
      }
    } catch (e) {
      erroredPools.push({
        msg: "Error while fetching liquidatable users " + (e as Error).stack,
        comptroller: pool.comptroller,
        error: {
          chainLiquidationConfig
        }
      });
    }
  }
  return [liquidations, erroredPools];
}
