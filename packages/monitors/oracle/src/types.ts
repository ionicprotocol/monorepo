import { MidasSdk } from "@midas-capital/sdk";
import { SupportedAsset } from "@midas-capital/types";
import { BigNumber, Contract } from "ethers";

export enum Services {
  FeedVerifier = "feed-verifier",
  PriceVerifier = "price-verifier",
  PriceChangeVerifier = "price-change-verifier",
}

export enum InvalidReason {
  DEVIATION_ABOVE_THRESHOLD = "DEVIATION_ABOVE_THRESHOLD",
  TWAP_LIQUIDITY_LOW = "TWAP_LIQUIDITY_LOW",
  LAST_OBSERVATION_TOO_OLD = "LAST_OBSERVATION_TOO_OLD",
  UNKNOWN = "UNKNOWN",
}

export enum OracleFailure {
  MPO_FAILURE = "MPO_FAILURE",
}

export type PriceFeedInvalidity = {
  invalidReason: InvalidReason;
  message: string;
};

export type SupportedAssetPriceFeed = {
  asset: SupportedAsset;
  feedValidity: PriceFeedInvalidity | null;
};

export interface VerifyPriceParams {
  midasSdk: MidasSdk;
  asset: SupportedAsset;
  mpoPrice: BigNumber;
}

export interface VerifyFeedParams {
  midasSdk: MidasSdk;
  underlyingOracle: Contract;
  underlying: string;
}

export type BaseConfig = {
  chainId: number;
  environment: string;
  logLevel: string;
  rpcUrl: string;
  supabaseUrl: string;
  supabasePublicKey: string;
  adminPrivateKey: string;
  supabaseOracleMonitorTableName: string;
  discordWebhookUrl: string;
};

export type FeedVerifierConfig = BaseConfig & {
  defaultDeviationThreshold: BigNumber;
  maxObservationDelay: number;
  runInterval: number;
  defaultMinPeriod: BigNumber;
};

export type PriceVerifierConfig = BaseConfig & {
  maxPriceDeviation: number;
  runInterval: number;
};

export type PriceChangeVerifierConfig = PriceVerifierConfig;
