import { MidasSdk } from "@midas-capital/sdk";
import { OracleTypes, SupportedAsset } from "@midas-capital/types";
import { BigNumber, Contract } from "ethers";

import { PriceFeedInvalidity } from "../../types";
import { DiscordService } from "../discord";

export abstract class AbstractOracleVerifier {
  asset: SupportedAsset;
  oracleType: OracleTypes;
  sdk: MidasSdk;
  mpo: Contract;
  alert: DiscordService;
  config: Record<string, BigNumber | string | number>;

  constructor(midasSdk: MidasSdk, asset: SupportedAsset) {
    this.asset = asset;
    this.sdk = midasSdk;
    this.mpo = midasSdk.createMasterPriceOracle();
    this.alert = new DiscordService(asset, midasSdk.chainId);
  }
  abstract init(): Promise<AbstractOracleVerifier | null>;
  abstract verify(): Promise<PriceFeedInvalidity | null>;
}
