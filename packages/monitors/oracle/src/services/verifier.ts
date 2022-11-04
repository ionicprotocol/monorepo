import { MidasSdk } from "@midas-capital/sdk";
import { SupportedAsset } from "@midas-capital/types";

import { getVerifier } from "../config";
import { PriceFeedInvalidity } from "../types";

import { AdminService } from "./admin";
import { PoolService } from "./pool";
import { AbstractOracleVerifier } from "./verifiers/base";

export class Verifier {
  oracleService: AbstractOracleVerifier;
  adminService: AdminService;
  poolService: PoolService;

  constructor(sdk: MidasSdk, asset: SupportedAsset) {
    this.poolService = new PoolService(sdk, asset);
    this.adminService = new AdminService(sdk, asset);
    this.oracleService = new (getVerifier())(sdk, asset);
  }
  async init(): Promise<Verifier> {
    await this.poolService.init();
    await this.adminService.init();
    await this.oracleService.init();
    return this;
  }
  async verify(): Promise<PriceFeedInvalidity | null> {
    return await this.oracleService.verify();
  }
}
