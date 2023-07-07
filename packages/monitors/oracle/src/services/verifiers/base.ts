import { MidasSdk } from "@ionicprotocol/sdk";
import { OracleTypes, SupportedAsset } from "@ionicprotocol/types";
import { Contract } from "ethers";

import { PriceFeedValidity, ServiceConfig, VerifierInitValidity } from "../../types";

export abstract class AbstractOracleVerifier {
  asset: SupportedAsset;
  oracleType: OracleTypes;
  sdk: MidasSdk;
  mpo: Contract;

  config: ServiceConfig;

  constructor(midasSdk: MidasSdk, asset: SupportedAsset, config: ServiceConfig) {
    this.asset = asset;
    this.sdk = midasSdk;
    this.config = config;
    this.mpo = midasSdk.createMasterPriceOracle();
  }
  abstract init(): Promise<[AbstractOracleVerifier, VerifierInitValidity]>;
  abstract verify(): Promise<PriceFeedValidity>;
}
