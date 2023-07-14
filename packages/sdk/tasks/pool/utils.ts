// pool utilities used across downstream tests
import { FusePool, FusePoolData } from "@ionicprotocol/types";

import { IonicSdk } from "../../src";

export const getPoolIndex = async (poolAddress: string, sdk: IonicSdk) => {
  const [indexes, publicPools] = await sdk.contracts.PoolLens.callStatic.getPublicPoolsWithData();
  for (let j = 0; j < publicPools.length; j++) {
    if (publicPools[j].comptroller === poolAddress) {
      return indexes[j];
    }
  }
  return null;
};

export const getPoolByName = async (name: string, sdk: IonicSdk, address?: string): Promise<FusePoolData | null> => {
  const [, publicPools] = await sdk.contracts.PoolLens.callStatic.getPublicPoolsWithData();
  for (let j = 0; j < publicPools.length; j++) {
    if (publicPools[j].name === name) {
      const poolIndex = await getPoolIndex(publicPools[j].comptroller, sdk);
      return await sdk.fetchPoolData(poolIndex!.toString(), { from: address });
    }
  }
  return null;
};

export const getAllPools = async (sdk: IonicSdk): Promise<FusePool[]> => {
  const [, publicPools] = await sdk.contracts.PoolLens.callStatic.getPublicPoolsWithData();
  return publicPools.map((pp) => {
    return {
      name: pp.name,
      comptroller: pp.comptroller,
      creator: pp.creator,
      blockPosted: pp.blockPosted.toNumber(),
      timestampPosted: pp.timestampPosted.toNumber(),
    };
  });
};

export const logPoolData = async (poolAddress: string, sdk: IonicSdk) => {
  const poolIndex = await getPoolIndex(poolAddress, sdk);
  const fusePoolData = await sdk.fetchPoolData(poolIndex!.toString());
  if (!fusePoolData) {
    throw `Pool with address ${poolAddress} is deprecated or cannot be found`;
  }
  const poolAssets = fusePoolData.assets.map((a) => a.underlyingSymbol).join(", ");
  console.log(`Operating on pool with address ${poolAddress}, name: ${fusePoolData.name}, assets ${poolAssets}`);
  return fusePoolData;
};
