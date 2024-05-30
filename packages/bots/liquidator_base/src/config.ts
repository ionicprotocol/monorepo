import doetenv from "dotenv";
doetenv.config();

const config = {
  environment: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? "8453", 10),
  rpcUrl: process.env.WEB3_HTTP_PROVIDER_URL ?? "https://mainnet.base.org/",
  adminPrivateKey: process.env.ETHEREUM_ADMIN_PRIVATE_KEY ?? "",
  adminAccount: process.env.ETHEREUM_ADMIN_ACCOUNT ?? "",
  excludedComptrollers: process.env.EXCLUDED_COMPTROLLERS ? process.env.EXCLUDED_COMPTROLLERS.split(",") : [],
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? "",
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? "",
  sendgridEmailTo: process.env.SENDGRID_EMAIL_TO ?? "dev@ionic.money",
};

export enum EXCLUDED_ERROR_CODES {
  NETWORK_ERROR,
  SERVER_ERROR,
}

export default config;
