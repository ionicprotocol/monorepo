import doetenv from "dotenv";
import { BigNumber, utils } from "ethers";

import {
  BaseConfig,
  FeedVerifierConfig,
  PriceChangeKind,
  PriceChangeVerifierConfig,
  PriceVerifierConfig,
  Services,
} from "../types";

import { defaultPriceDeviationPeriods } from "./priceChangeVerifier/defaults";
doetenv.config();

export const baseConfig: BaseConfig = {
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? "56", 10),
  environment: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
  rpcUrl: process.env.WEB3_HTTP_PROVIDER_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "https://xdjnvsfkwtkwfuayzmtm.supabase.co",
  supabasePublicKey: process.env.SUPABASE_KEY ?? "",
  supabaseOracleCircuitBreakerTableName: process.env.SUPABASE_ORACLE_CIRCUIT_BREAKER_TABLE_NAME ?? "oracle-price-cache",
  adminPrivateKey: process.env.ETHEREUM_ADMIN_PRIVATE_KEY ?? "",
  adminAccount: process.env.ETHEREUM_ADMIN_ACCOUNT ?? "",
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? "",
  service: process.env.SERVICE ? (process.env.SERVICE as Services) : Services.FeedVerifier,
};

const feedVerifierConfig: FeedVerifierConfig = {
  ...baseConfig,
  defaultDeviationThreshold: parseFloat(process.env.DEFAULT_DEVIATION_THRESHOLD ?? "0.05"),
  defaultMaxObservationDelay: parseInt(process.env.MAX_OBSERVATION_DELAY ?? "86400"),
  defaultMinPeriod: parseInt(process.env.DEFAULT_MIN_PERIOD ?? "1800"),
};

const priceVerifierConfig: PriceVerifierConfig = {
  ...baseConfig,
  defaultMaxPriceDeviation: parseInt(process.env.MAX_PRICE_DEVIATION ?? "15"),
};

const priceChangeVerifierConfig: PriceChangeVerifierConfig = {
  ...baseConfig,
  priceDeviationPeriods: {
    [PriceChangeKind.SHORT]: defaultPriceDeviationPeriods[PriceChangeKind.SHORT],
    [PriceChangeKind.LONG]: defaultPriceDeviationPeriods[PriceChangeKind.SHORT],
  },
};

export const configs = {
  [Services.FeedVerifier]: feedVerifierConfig,
  [Services.PriceVerifier]: priceVerifierConfig,
  [Services.PriceChangeVerifier]: priceChangeVerifierConfig,
};
