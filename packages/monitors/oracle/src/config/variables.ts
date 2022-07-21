import doetenv from "dotenv";
import { BigNumber, utils } from "ethers";
doetenv.config();

const config = {
  chainId: parseInt(process.env.TARGET_CHAIN_ID ?? "56", 10),
  rpcUrl: process.env.WEB3_HTTP_PROVIDER_URL ?? "https://bsc-dataseed1.binance.org/",
  supabaseUrl: process.env.SUPABASE_URL ?? "https://xdjnvsfkwtkwfuayzmtm.supabase.co",
  supabasePublicKey: process.env.SUPABASE_KEY ?? "",
  adminPrivateKey: process.env.ETHEREUM_ADMIN_PRIVATE_KEY ?? "",
  supabaseOracleMonitorTableName: process.env.SUPABASE_ORACLE_MONITOR_TABLE_NAME ?? "oracle-monitor",
  maxObservationDelay: parseInt(process.env.MAX_OBSERVATION_DELAY ?? "1800"),
  checkPriceInterval: parseInt(process.env.CHECK_PRICE_INTERVAL ?? "21600") * 1000, // 6 hours
  defaultMinPeriod: BigNumber.from(process.env.DEFAULT_MIN_PERIOD ?? "1800"),
  defaultDeviationThreshold: utils.parseEther(process.env.DEFAULT_DEVIATION_THRESHOLD ?? "0.05"),
  minTwapDepth: parseFloat(process.env.MINIMAL_TWAP_DEPTH ?? "1000000"),
};

export default config;
