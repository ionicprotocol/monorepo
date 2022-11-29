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
};

export type UniswapV3AssetConfig = UniswapV2AssetConfig & {
  fee: number;
};

export type CurvePoolConfig = BaseAssetConfig & {
  poolAddress: string;
  minLiquidity?: number;
};

export type BalancerPoolConfig = BaseAssetConfig & {
  poolAddress: string;
  minLiquidity?: number;
};

export type TAssetConfig = UniswapV2AssetConfig | UniswapV3AssetConfig | CurvePoolConfig | BalancerPoolConfig;

export type Reserve = {
  underlying: Contract;
  reserves: BigNumber;
};
