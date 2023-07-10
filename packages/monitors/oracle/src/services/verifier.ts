import { IonicSdk } from "@ionicprotocol/sdk";
import { SupportedAsset } from "@ionicprotocol/types";

import { logger } from "../logger";
import { ErrorKind, PriceFeedValidity, ServiceConfig, TVerifier, VerifierInitValidity } from "../types";

import { AdminService } from "./admin";
import { DiscordService } from "./discord";
import { PoolService } from "./pool";
import { AbstractOracleVerifier } from "./verifiers/base";

export class Verifier {
  oracleService: AbstractOracleVerifier;
  adminService: AdminService;
  poolService: PoolService;

  constructor(sdk: IonicSdk, service: TVerifier, asset: SupportedAsset, config: ServiceConfig) {
    this.poolService = new PoolService(sdk, asset);
    this.adminService = new AdminService(sdk, asset);
    this.oracleService = new service(sdk, asset, config);
  }
  async init(): Promise<[Verifier, VerifierInitValidity]> {
    this.poolService = await this.poolService.init();
    this.adminService = await this.adminService.init();
    const [oracleService, initError] = await this.oracleService.init();
    if (initError !== null) {
      return [this, initError];
    } else {
      this.oracleService = oracleService;
      return [this, null];
    }
  }
  async verify(): Promise<PriceFeedValidity> {
    return await this.oracleService.verify();
  }
}

export class BatchVerifier {
  assets: SupportedAsset[];
  sdk: IonicSdk;
  service: TVerifier;
  config: ServiceConfig;
  alert: DiscordService;

  constructor(sdk: IonicSdk, assets: SupportedAsset[]) {
    this.assets = assets;
    this.sdk = sdk;
    this.alert = new DiscordService(sdk.chainId);
  }

  async batchVerify(service: TVerifier, config: ServiceConfig) {
    logger.info(`Running batch verify for ${service.name} on ${this.sdk.chainId} on ${this.assets.length} assets`);
    for (const asset of this.assets) {
      const [verifier, error] = await new Verifier(this.sdk, service, asset, config).init();
      if (error !== null) {
        logger.error(`SERVICE ${service.name}: Could not initialize verifier for ${asset.symbol}`);
        await this.alert.sendErrorNotification(error, asset, ErrorKind.init);
      }

      const result = await verifier.verify();
      if (result !== true) {
        logger.error(`SERVICE ${service.name}: INVALID REASON: ${result.invalidReason} MSG: ${result.message}`);
        await this.alert.sendErrorNotification(result, asset, ErrorKind.verification);
      } else {
        logger.info(`SERVICE ${service.name}: Price feed for ${asset.symbol} is valid`);
      }
    }
    logger.info(`Batch verification for ${service.name} completed`);
  }
}
