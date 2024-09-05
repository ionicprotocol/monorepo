import doetenv from 'dotenv';
doetenv.config();

const config = {
  environment: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? '34443', 10),
  rpcUrls: process.env.BASE_MAINNET_RPCS
    ? process.env.BASE_MAINNET_RPCS.split(',')
    : ['https://mainnet.mode.network/'], // Updated to handle multiple RPC URLs
  adminPrivateKey: process.env.ETHEREUM_ADMIN_PRIVATE_KEY ?? '',
  adminAccount: process.env.ETHEREUM_ADMIN_ACCOUNT ?? '',
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? '',
  priceServiceEndpoint: 'https://hermes.pyth.network/',
};

export default config;
