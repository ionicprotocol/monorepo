// pool utilities used across downstream tests
import { FusePool, FusePoolData } from "@ionicprotocol/types";

import { MidasSdk } from "../../src";

export const getPoolIndex = async (poolAddress: string, sdk: MidasSdk) => {
  const [indexes, publicPools] = await sdk.contracts.FusePoolLens.callStatic.getPublicPoolsWithData();
  for (let j = 0; j < publicPools.length; j++) {
    if (publicPools[j].comptroller === poolAddress) {
      return indexes[j];
    }
  }
  return null;
};

export const getPoolByName = async (name: string, sdk: MidasSdk, address?: string): Promise<FusePoolData | null> => {
  const [, publicPools] = await sdk.contracts.FusePoolLens.callStatic.getPublicPoolsWithData();
  for (let j = 0; j < publicPools.length; j++) {
    if (publicPools[j].name === name) {
      const poolIndex = await getPoolIndex(publicPools[j].comptroller, sdk);
      return await sdk.fetchFusePoolData(poolIndex!.toString(), { from: address });
    }
  }
  return null;
};

export const getAllPools = async (sdk: MidasSdk): Promise<FusePool[]> => {
  const [, publicPools] = await sdk.contracts.FusePoolLens.callStatic.getPublicPoolsWithData();
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

export const logPoolData = async (poolAddress: string, sdk: MidasSdk) => {
  const poolIndex = await getPoolIndex(poolAddress, sdk);
  const fusePoolData = await sdk.fetchFusePoolData(poolIndex!.toString());
  if (!fusePoolData) {
    throw `Pool with address ${poolAddress} is deprecated or cannot be found`;
  }
  const poolAssets = fusePoolData.assets.map((a) => a.underlyingSymbol).join(", ");
  console.log(`Operating on pool with address ${poolAddress}, name: ${fusePoolData.name}, assets ${poolAssets}`);
  return fusePoolData;
};
