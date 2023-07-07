import { MidasSdk } from "@ionicprotocol/sdk";

import { LiquidityPoolKind, LiquidityValidity, ServiceConfig, TAssetConfig, VerifierInitValidity } from "../../types";

export abstract class AbstractLiquidityVerifier {
  asset: TAssetConfig;
  sdk: MidasSdk;
  config: ServiceConfig;

  constructor(midasSdk: MidasSdk, asset: TAssetConfig, config: ServiceConfig) {
    this.asset = asset;
    this.sdk = midasSdk;
    this.config = config;
  }
  abstract init(): Promise<[AbstractLiquidityVerifier, VerifierInitValidity]>;
  abstract verify(poolKind: LiquidityPoolKind): Promise<LiquidityValidity>;
}
