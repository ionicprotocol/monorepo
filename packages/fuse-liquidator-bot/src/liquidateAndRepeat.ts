import { liquidateUnhealthyBorrows, logger, setUpSdk } from "./index";
import { JsonRpcProvider } from "@ethersproject/providers";

// Liquidate unhealthy borrows and repeat every LIQUIDATION_INTERVAL_SECONDS
export default async function liquidateAndRepeat(chainId: number, provider: JsonRpcProvider) {
  const fuse = setUpSdk(chainId, provider);
  logger.info(`Config for bot: ${JSON.stringify(fuse.chainLiquidationConfig)}`);
  await liquidateUnhealthyBorrows(fuse);
  setTimeout(liquidateAndRepeat, fuse.chainLiquidationConfig.LIQUIDATION_INTERVAL_SECONDS * 1000, chainId, provider);
}
