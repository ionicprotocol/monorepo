import { BigNumber } from "ethers";

import { MidasBase } from "../../MidasSdk";

import { ChainLiquidationConfig } from "./config";
import {
  EncodedLiquidationTx,
  FusePoolUserStruct,
  FusePoolUserWithAssets,
  LiquidatablePool,
  PublicPoolUserWithData,
} from "./utils";

import { getPotentialLiquidation } from "./index";

async function getLiquidatableUsers(
  fuse: MidasBase,
  poolUsers: FusePoolUserStruct[],
  pool: PublicPoolUserWithData,
  chainLiquidationConfig: ChainLiquidationConfig
): Promise<Array<EncodedLiquidationTx>> {
  const users: Array<EncodedLiquidationTx> = [];
  for (const user of poolUsers) {
    const userAssets = await fuse.contracts.FusePoolLens.callStatic.getPoolAssetsByUser(pool.comptroller, user.account);
    const userWithAssets: FusePoolUserWithAssets = {
      ...user,
      debt: [],
      collateral: [],
      assets: userAssets,
    };

    const encodedLiquidationTX = await getPotentialLiquidation(
      fuse,
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
  fuse: MidasBase,
  pools: Array<PublicPoolUserWithData>,
  chainLiquidationConfig: ChainLiquidationConfig
): Promise<Array<LiquidatablePool>> {
  const liquidations: Array<LiquidatablePool> = [];
  for (const pool of pools) {
    const poolUsers = pool.users
      .slice()
      .sort((a, b) => BigNumber.from(b.totalBorrow).sub(BigNumber.from(a.totalBorrow)).toNumber());
    const liquidatableUsers = await getLiquidatableUsers(fuse, poolUsers, pool, chainLiquidationConfig);
    if (liquidatableUsers.length > 0) {
      liquidations.push({
        comptroller: pool.comptroller,
        liquidations: liquidatableUsers,
      });
    }
  }
  return liquidations;
}
