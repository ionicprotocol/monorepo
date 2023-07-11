import { IonicSdk } from "@ionicprotocol/sdk";

import { LiquidityPoolKind, LiquidityValidity, ServiceConfig, TAssetConfig, VerifierInitValidity } from "../../types";

export abstract class AbstractLiquidityVerifier {
  asset: TAssetConfig;
  sdk: IonicSdk;
  config: ServiceConfig;

  constructor(ionicSdk: IonicSdk, asset: TAssetConfig, config: ServiceConfig) {
    this.asset = asset;
    this.sdk = ionicSdk;
    this.config = config;
  }
  abstract init(): Promise<[AbstractLiquidityVerifier, VerifierInitValidity]>;
  abstract verify(poolKind: LiquidityPoolKind): Promise<LiquidityValidity>;
}
