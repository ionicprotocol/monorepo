import doetenv from "dotenv";
import { BigNumber, utils } from "ethers";

import { BaseConfig, FeedVerifierConfig, PriceChangeVerifierConfig, PriceVerifierConfig, Services } from "../types";
doetenv.config();

export const baseConfig: BaseConfig = {
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? "56", 10),
  environment: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
  rpcUrl: process.env.WEB3_HTTP_PROVIDER_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "https://xdjnvsfkwtkwfuayzmtm.supabase.co",
  supabasePublicKey: process.env.SUPABASE_KEY ?? "",
  adminPrivateKey: process.env.ETHEREUM_ADMIN_PRIVATE_KEY ?? "",
  supabaseOracleMonitorTableName: process.env.SUPABASE_ORACLE_MONITOR_TABLE_NAME ?? "oracle-monitor",
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? "",
};

const feedVerifierConfig: FeedVerifierConfig = {
  ...baseConfig,
  defaultDeviationThreshold: utils.parseEther(process.env.DEFAULT_DEVIATION_THRESHOLD ?? "0.05"),
  maxObservationDelay: parseInt(process.env.MAX_OBSERVATION_DELAY ?? "10000"),
  runInterval:
    parseInt(process.env.FEED_VERIFIER_RUN_INTERVAL ?? (process.env.NODE_ENV === "production" ? "3600" : "20")) * 1000, // 1 hours
  defaultMinPeriod: BigNumber.from(process.env.DEFAULT_MIN_PERIOD ?? "1800"),
};

const priceVerifierConfig: PriceVerifierConfig = {
  ...baseConfig,
  runInterval:
    parseInt(process.env.FEED_VERIFIER_RUN_INTERVAL ?? (process.env.NODE_ENV === "production" ? "60" : "20")) * 1000, // 1 minute
  maxPriceDeviation: parseInt(process.env.MAX_PRICE_DEVIATION ?? "15"),
};

const priceChangeVerifierConfig: PriceChangeVerifierConfig = {
  ...baseConfig,
  runInterval: parseInt(process.env.FEED_VERIFIER_RUN_INTERVAL ?? "15") * 1000, // 15 seconds
  maxPriceDeviation: parseInt(process.env.MAX_PRICE_DEVIATION ?? "15"),
};

export const configs = {
  [Services.FeedVerifier]: feedVerifierConfig,
  [Services.PriceVerifier]: priceVerifierConfig,
  [Services.PriceChangeVerifier]: priceChangeVerifierConfig,
};
