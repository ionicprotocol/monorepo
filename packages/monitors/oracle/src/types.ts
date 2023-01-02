import { arbitrum, bsc, evmos, moonbeam, polygon } from "@midas-capital/chains";
import { MidasSdk } from "@midas-capital/sdk";
import { ChainConfig, SupportedAsset } from "@midas-capital/types";
import { BigNumber, Contract } from "ethers";

import { FeedVerifier, PriceChangeVerifier, PriceVerifier } from "./services";

export type TVerifier = typeof FeedVerifier | typeof PriceVerifier | typeof PriceChangeVerifier;

export enum Services {
  FeedVerifier = "feed-verifier",
  PriceVerifier = "price-verifier",
  PriceChangeVerifier = "price-change-verifier",
}

export type ServiceConfig = FeedVerifierConfig | PriceVerifierConfig | PriceChangeVerifierConfig;

export type VerifierConfig = {
  assets: SupportedAsset[];
  verifier: TVerifier;
  config: ServiceConfig;
};

export enum InvalidReason {
  DEVIATION_ABOVE_THRESHOLD = "DEVIATION_ABOVE_THRESHOLD",
  TWAP_LIQUIDITY_LOW = "TWAP_LIQUIDITY_LOW",
  LAST_OBSERVATION_TOO_OLD = "LAST_OBSERVATION_TOO_OLD",
  UNKNOWN = "UNKNOWN",
  DEFI_LLAMA_API_ERROR = "DEFI_LLAMA_API_ERROR",
}

export enum OracleFailure {
  MPO_FAILURE = "MPO_FAILURE",
  NO_ORACLE_FOUND = "NO_ORACLE_FOUND",
}

export type Failure = InvalidReason | OracleFailure;

export type PriceFeedInvalidity = {
  invalidReason: Failure;
  message: string;
};

export type VerifierInitError = {
  invalidReason: Failure;
  message: string;
};

export type VerifierInitValidity = VerifierInitError | null;

export type PriceFeedValidity = PriceFeedInvalidity | true;

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
  adminAccount: string;
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
  defaultMaxPriceDeviation: number;
  runInterval: number;
};

export type PriceChangeVerifierConfig = BaseConfig & {
  runInterval: number;
  defaultPriceDeviationThresholds: {
    "3m": number;
    "15m": number;
  };
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [arbitrum.chainId]: arbitrum,
  [evmos.chainId]: evmos,
};

export type VerificationErrorCache = Array<{ asset: SupportedAsset; error: PriceFeedInvalidity; timestamp: number }>;
export type InitErrorCache = Array<{ asset: SupportedAsset; error: VerifierInitError; timestamp: number }>;

export enum ErrorKind {
  init = "init",
  verification = "verification",
}

export type FeedVerifierAsset = SupportedAsset & {
  minPeriod?: BigNumber;
  deviationThreshold?: BigNumber;
};

export type PriceVerifierAsset = SupportedAsset & {
  maxPriceDeviation?: number;
};

export type PriceChangeVerifierAsset = SupportedAsset & {
  priceDeviationThresholds?: {
    "3m": number;
    "15m": number;
  };
};
