import { IonicSdk } from "@ionicprotocol/sdk";
import { SupportedAsset } from "@ionicprotocol/types";

import { AMMLiquidityVerifier } from "../services";

import { TAssetConfig } from "./asset";
import { LiquidityMonitorChains, LiquidityPoolKind } from "./pool";

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
  ionicSdk: IonicSdk;
  asset: TAssetConfig;
  poolKind: LiquidityPoolKind;
}

export type MonitoredAssetsConfig = { [key in LiquidityPoolKind]: TAssetConfig[] };

export type MonitoredChainAssets = {
  [key in LiquidityMonitorChains]: MonitoredAssetsConfig;
};
