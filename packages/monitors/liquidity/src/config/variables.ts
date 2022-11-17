import doetenv from "dotenv";

import { BaseConfig, LiquidityDepthConfig, Services } from "../types";
doetenv.config();

export const baseConfig: BaseConfig = {
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? "56", 10),
  environment: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
  rpcUrl: process.env.WEB3_HTTP_PROVIDER_URL ?? "",
  adminPrivateKey: process.env.ETHEREUM_ADMIN_PRIVATE_KEY ?? "",
  adminAccount: process.env.ETHEREUM_ADMIN_ACCOUNT ?? "",
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? "",
};

const liquidityVerifierConfig: LiquidityDepthConfig = {
  ...baseConfig,
  minTwapDepth: parseInt(process.env.MIN_TWAP_DEPTH ?? "500000", 10),
  runInterval:
    parseInt(process.env.FEED_VERIFIER_RUN_INTERVAL ?? (process.env.NODE_ENV === "production" ? "3600" : "20")) * 1000, // 1 hours
};

export const configs = {
  [Services.LiquidityDepthVerifier]: liquidityVerifierConfig,
};
