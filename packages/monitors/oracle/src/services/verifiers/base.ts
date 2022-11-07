import { MidasSdk } from "@midas-capital/sdk";
import { OracleTypes, SupportedAsset } from "@midas-capital/types";
import { Contract } from "ethers";

import { PriceFeedValidity, ServiceConfig } from "../../types";
import { DiscordService } from "../discord";

export abstract class AbstractOracleVerifier {
  asset: SupportedAsset;
  oracleType: OracleTypes;
  sdk: MidasSdk;
  mpo: Contract;
  alert: DiscordService;
  config: ServiceConfig;

  constructor(midasSdk: MidasSdk, asset: SupportedAsset, config: ServiceConfig) {
    this.asset = asset;
    this.sdk = midasSdk;
    this.config = config;
    this.mpo = midasSdk.createMasterPriceOracle();
    this.alert = new DiscordService(asset, midasSdk.chainId, config);
  }
  abstract init(): Promise<AbstractOracleVerifier | null>;
  abstract verify(): Promise<PriceFeedValidity>;
}
