import { MidasSdk } from "@midas-capital/sdk";

import { AssetConfig, LiquidityValidity, ServiceConfig, VerifierInitValidity } from "../../types";

export abstract class AbstractLiquidityVerifier {
  asset: AssetConfig;
  sdk: MidasSdk;
  config: ServiceConfig;

  constructor(midasSdk: MidasSdk, asset: AssetConfig, config: ServiceConfig) {
    this.asset = asset;
    this.sdk = midasSdk;
    this.config = config;
  }
  abstract init(): Promise<[AbstractLiquidityVerifier, VerifierInitValidity]>;
  abstract verify(): Promise<LiquidityValidity>;
}
