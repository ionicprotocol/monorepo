import { IonicSdk } from "@ionicprotocol/sdk";

import { logger } from "..";
import {
  LiquidityPoolKind,
  LiquidityValidity,
  MonitoredAssetsConfig,
  ServiceConfig,
  TAssetConfig,
  TVerifier,
  VerifierInitValidity,
} from "../types";

import { AdminService } from "./admin";
import { DiscordService } from "./discord";
import { AbstractLiquidityVerifier } from "./monitor/base";
import { PoolService } from "./pool";

export class Verifier {
  liquidityService: AbstractLiquidityVerifier;
  adminService: AdminService;
  poolService: PoolService;

  constructor(sdk: IonicSdk, service: TVerifier, asset: TAssetConfig, config: ServiceConfig) {
    this.poolService = new PoolService(sdk, asset.affectedAssets);
    this.adminService = new AdminService(sdk);
    this.liquidityService = new service(sdk, asset, config);
  }
  async init(): Promise<[Verifier, VerifierInitValidity]> {
    this.poolService = await this.poolService.init();
    this.adminService = await this.adminService.init();
    const [oracleService, initError] = await this.liquidityService.init();
    if (initError !== null) {
      return [this, initError];
    } else {
      this.liquidityService = oracleService;
      return [this, null];
    }
  }
  async verify(poolKind: LiquidityPoolKind): Promise<LiquidityValidity> {
    return await this.liquidityService.verify(poolKind);
  }
}

export class BatchVerifier {
  assets: MonitoredAssetsConfig;
  sdk: IonicSdk;
  alert: DiscordService;

  constructor(sdk: IonicSdk, assets: MonitoredAssetsConfig) {
    this.assets = assets;
    this.sdk = sdk;
    this.alert = new DiscordService(sdk.chainId);
  }

  async batchVerify(service: TVerifier, config: ServiceConfig): Promise<void> {
    Object.values(LiquidityPoolKind).forEach(async (pk) => {
      const assets = this.assets[pk];
      logger.warn(`Running batch verify for ${service.name} on ${this.sdk.chainId} on ${assets.length}`);

      for (const asset of assets) {
        const [verifier] = await new Verifier(this.sdk, service, asset, config).init();
        const result = await verifier.verify(pk);

        if (result !== true) {
          logger.error(`SERVICE ${service.name}: INVALID REASON: ${result.invalidReason} MSG: ${result.message}`);
          await this.alert.sendErrorNotification(result, asset);
        } else {
          logger.debug(`SERVICE ${service.name}: Price feed for ${asset.identifier} is valid`);
        }
      }
      logger.info(`Batch verification for ${service.name} completed`);
    });
  }
}
