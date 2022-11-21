import { MidasSdk } from "@midas-capital/sdk";
import { arbitrum, bsc, moonbeam, polygon } from "@midas-capital/chains";
import { ChainConfig, SupportedAsset } from "@midas-capital/types";
import { AMMLiquidityVerifier } from "../services";
import { TAssetConfig } from "./asset";
import { LiquidityPoolKind, LiquidityMonitorChains } from "./pool";

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [arbitrum.chainId]: arbitrum,
};

export type TVerifier = typeof AMMLiquidityVerifier;

export enum Services {
  LiquidityDepthVerifier = "liquidity-depth-verifier",
}

export type ServiceConfig = LiquidityDepthConfig;

export type VerifierConfig = {
  assets: SupportedAsset[];
  verifier: TVerifier;
  config: ServiceConfig;
};

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

export interface VerifyLiquidityParams {
  midasSdk: MidasSdk;
  asset: TAssetConfig;
  poolKind: LiquidityPoolKind;
}

export type MonitoredAssetsConfig = { [key in LiquidityPoolKind]: TAssetConfig[] };

export type MonitoredChainAssets = {
  [key in LiquidityMonitorChains]: MonitoredAssetsConfig;
};
