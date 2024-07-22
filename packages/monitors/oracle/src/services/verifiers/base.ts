import { IonicSdk, masterPriceOracleAbi } from "@ionicprotocol/sdk";
import { OracleTypes, SupportedAsset } from "@ionicprotocol/types";
import { GetContractReturnType, WalletClient } from "viem";

import { PriceFeedValidity, ServiceConfig, VerifierInitValidity } from "../../types";

export abstract class AbstractOracleVerifier {
  asset: SupportedAsset;
  oracleType: OracleTypes;
  sdk: IonicSdk;
  mpo: GetContractReturnType<typeof masterPriceOracleAbi, WalletClient>;

  config: ServiceConfig;

  constructor(ionicSdk: IonicSdk, asset: SupportedAsset, config: ServiceConfig) {
    this.asset = asset;
    this.sdk = ionicSdk;
    this.config = config;
    this.mpo = ionicSdk.createMasterPriceOracle();
  }
  abstract init(): Promise<[AbstractOracleVerifier, VerifierInitValidity]>;
  abstract verify(): Promise<PriceFeedValidity>;
}
