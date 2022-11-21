import { SupportedAsset } from "@midas-capital/types";
import { BigNumber, Contract } from "ethers";

export type BaseAssetConfig = {
  affectedAssets: SupportedAsset[];
  identifier: string;
};

export type UniswapV2AssetConfig = BaseAssetConfig & {
  token0: string;
  token1: string;
  alternativeFactory?: string;
  minLiquidity?: number;
  affectedUnderlyingAssets?: string[];
};

export type UniswapV3AssetConfig = UniswapV2AssetConfig & {
  fee: number;
};

export type CurveV1PoolConfig = BaseAssetConfig & {
  pool: string;
  underlyings: string[];
  minLiquidity?: number;
};

export type BalancerPoolConfig = BaseAssetConfig & {
  poolAddress: string;
  minLiquidity?: number;
};

export type TAssetConfig = UniswapV2AssetConfig | UniswapV3AssetConfig | CurveV1PoolConfig | BalancerPoolConfig;

export type Reserve = {
  underlying: Contract;
  reserves: BigNumber;
};
