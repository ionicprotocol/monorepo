import doetenv from "dotenv";
doetenv.config();

const config = {
  environment: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? "56", 10),
  rpcUrl: process.env.WEB3_HTTP_PROVIDER_URL ?? "https://bsc-dataseed1.binance.org/",
  adminPrivateKey: process.env.ETHEREUM_ADMIN_PRIVATE_KEY ?? "",
  adminAccount: process.env.ETHEREUM_ADMIN_ACCOUNT ?? "",
  excludedComptrollers: process.env.EXCLUDED_COMPTROLLERS ? process.env.EXCLUDED_COMPTROLLERS.split(",") : [],
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? "",
};

export enum EXCLUDED_ERROR_CODES {
  NETWORK_ERROR,
  SERVER_ERROR,
}

export default config;
