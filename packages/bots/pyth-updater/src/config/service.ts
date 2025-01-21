import doetenv from 'dotenv';
doetenv.config();

const config = {
  environment: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? '8453', 10),
  rpcUrls: process.env.WEB3_HTTP_PROVIDER_URLS
    ? process.env.WEB3_HTTP_PROVIDER_URLS.split(',')
    : ['https://base-rpc.publicnode.com'], // Updated to handle multiple RPC URLs
  adminPrivateKey: process.env.PYTH_UPDATER_ETHEREUM_ADMIN_PRIVATE_KEY ?? '',
  adminAccount: process.env.PYTH_UPDATER_ETHEREUM_ADMIN_ACCOUNT ?? '',
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? '',
  priceServiceEndpoint: 'https://hermes.pyth.network/',
};

export default config;
