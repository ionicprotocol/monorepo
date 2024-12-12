import doetenv from 'dotenv';
doetenv.config();

const config = {
  environment: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? '8453', 10),
  rpcUrls: process.env.BASE_MAINNET_RPCS
    ? process.env.BASE_MAINNET_RPCS.split(',')
    : ['https://base-rpc.publicnode.com'], // Updated to handle multiple RPC URLs
  adminPrivateKey: process.env.PYTH_UPDATER_ETHEREUM_ADMIN_PRIVATE_KEY ?? '',
  adminAccount: process.env.PYTH_UPDATER_ETHEREUM_ADMIN_ACCOUNT ?? '',
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL ?? 'https://discord.com/api/webhooks/1268928193004568576/iSeYQhg25xjiGS3raJ6bbgJlL_RtcrejYPwn1PXosWicCS34aYVv-LpoECC69vHiAJ2D',
  priceServiceEndpoint: 'https://hermes.pyth.network/',
};

export default config;
