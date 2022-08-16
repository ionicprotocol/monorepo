import doetenv from "dotenv";
import { BigNumber } from "ethers";
doetenv.config();

const config = {
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? "56", 10),
  rpcUrl: process.env.WEB3_HTTP_PROVIDER_URL ?? "https://bsc-dataseed1.binance.org/",
  adminPrivateKey: process.env.ETHEREUM_ADMIN_PRIVATE_KEY ?? "",
  adminAccount: process.env.ETHEREUM_ADMIN_ACCOUNT ?? "",
  supportedParis: process.env.SUPPORTED_PAIRS ?? "",
  speedupTxAfterSeconds: parseInt(process.env.SPEED_UP_TRANSACTION_AFTER_SECONDS ?? "120"),
  redundancyDelaySeconds: parseInt(process.env.REDUNDANCY_DELAY_SECONDS ?? "0"),
  defaultMinPeriod: BigNumber.from(process.env.DEFAULT_MIN_PERIOD ?? "1800"),
  defaultDeviationThreshold: process.env.DEFAULT_DEVIATION_THRESHOLD ?? "0.05",
  twapUpdateIntervalSeconds: parseInt(process.env.TWAP_UPDATE_ATTEMPT_INTERVAL_SECONDS ?? "5") * 1000,
};

export default config;
