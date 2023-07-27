import doetenv from 'dotenv';
doetenv.config();

const config = {
  environment: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? '59144', 10),
  rpcUrl: process.env.WEB3_HTTP_PROVIDER_URL ?? 'https://linea-mainnet.infura.io/v3/',
  adminPrivateKey: process.env.ETHEREUM_ADMIN_PRIVATE_KEY ?? '',
  adminAccount: process.env.ETHEREUM_ADMIN_ACCOUNT ?? '',
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? '',
  priceServiceEndpoint: process.env.PRICE_SERVICE_ENDPOINT ?? 'https://xc-mainnet.pyth.network',
};

export default config;
