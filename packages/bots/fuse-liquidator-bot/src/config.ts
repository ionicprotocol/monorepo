import doetenv from "dotenv";
doetenv.config();

const config = {
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? "56", 10),
  rpcUrl: process.env.WEB3_HTTP_PROVIDER_URL ?? "https://bsc-dataseed1.binance.org/",
  adminPrivateKey: process.env.ETHEREUM_ADMIN_PRIVATE_KEY ?? "",
  adminAccount: process.env.ETHEREUM_ADMIN_ACCOUNT ?? "",
};

export default config;
