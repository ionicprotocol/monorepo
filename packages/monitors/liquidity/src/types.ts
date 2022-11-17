import { arbitrum, bsc, moonbeam, polygon } from "@midas-capital/chains";
import { MidasSdk } from "@midas-capital/sdk";
import { ChainConfig, SupportedAsset } from "@midas-capital/types";
import { Contract } from "ethers";

import { AMMLiquidityVerifier } from "./services";

export type TVerifier = typeof AMMLiquidityVerifier;

export enum Services {
  LiquidityDepthVerifier = "liquidity-depth-verifier",
}

export type LiquidityInvalidity = {
  invalidReason: Failure;
  message: string;
  valueUSD: number;
};

export type LiquidityValidity = LiquidityInvalidity | true;

export type VerifierInitError = {
  invalidReason: Failure;
  message: string;
};

export type VerifierInitValidity = VerifierInitError | null;

export type ServiceConfig = LiquidityDepthConfig;

export type VerifierConfig = {
  assets: SupportedAsset[];
  verifier: TVerifier;
  config: ServiceConfig;
};

export enum InvalidReason {
  TWAP_LIQUIDITY_LOW = "TWAP_LIQUIDITY_LOW",
}

export enum OracleFailure {
  MPO_FAILURE = "MPO_FAILURE",
  NO_ORACLE_FOUND = "NO_ORACLE_FOUND",
}

export type Failure = InvalidReason | OracleFailure;

export enum LiquidityPoolKind {
  UniswapV2 = "UniswapV2",
  UniswapV3 = "UniswapV3",
  CurveV1 = "CurveV1",
  CurveV2 = "CurveV2",
  Balancer = "Balancer",
}

export type UniswapV2AssetConfig = {
  token0: string;
  token1: string;
  alternativeFactory?: string;
  minLiquidity?: number;
  affectedUnderlyingAssets?: string[];
};

export type UniswapV3AssetConfig = UniswapV2AssetConfig & {
  fee: number;
};

export type CurveV1PoolConfig = {
  pool: string;
  underlyings: string[];
};

export type AssetConfig = UniswapV2AssetConfig | UniswapV3AssetConfig | CurveV1PoolConfig;
export interface VerifyLiquidityParams {
  midasSdk: MidasSdk;
  asset: UniswapV3AssetConfig | UniswapV2AssetConfig | CurveV1PoolConfig;
}

export type BaseConfig = {
  chainId: number;
  environment: string;
  logLevel: string;
  rpcUrl: string;
  adminPrivateKey: string;
  adminAccount: string;
  discordWebhookUrl: string;
};

export type LiquidityDepthConfig = BaseConfig & {
  minLiquidity: number;
  runInterval: number;
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [arbitrum.chainId]: arbitrum,
};

export enum ErrorKind {
  init = "init",
  verification = "verification",
}

export type VerificationErrorCache = Array<{ asset: SupportedAsset; error: LiquidityInvalidity; timestamp: number }>;
export type InitErrorCache = Array<{ asset: SupportedAsset; error: VerifierInitError; timestamp: number }>;
