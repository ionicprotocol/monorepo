import { MidasSdk } from "@midas-capital/sdk";
import { SupportedAsset } from "@midas-capital/types";

import { PriceFeedValidity, ServiceConfig, TVerifier } from "../types";

import { AdminService } from "./admin";
import { PoolService } from "./pool";
import { AbstractOracleVerifier } from "./verifiers/base";

export class Verifier {
  oracleService: AbstractOracleVerifier;
  adminService: AdminService;
  poolService: PoolService;

  constructor(sdk: MidasSdk, service: TVerifier, asset: SupportedAsset, config: ServiceConfig) {
    this.poolService = new PoolService(sdk, asset);
    this.adminService = new AdminService(sdk, asset);
    this.oracleService = new service(sdk, asset, config);
  }
  async init(): Promise<Verifier | null> {
    const poolService = await this.poolService.init();
    const adminService = await this.adminService.init();
    const oracleService = await this.oracleService.init();
    if (poolService && adminService && oracleService) {
      return this;
    } else {
      return null;
    }
  }
  async verify(): Promise<PriceFeedValidity> {
    return await this.oracleService.verify();
  }
}
