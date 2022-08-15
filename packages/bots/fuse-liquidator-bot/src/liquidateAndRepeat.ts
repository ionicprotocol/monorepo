import { JsonRpcProvider } from "@ethersproject/providers";

import { liquidateOrRetry, logger, setUpSdk } from "./index";

// Liquidate unhealthy borrows and repeat every LIQUIDATION_INTERVAL_SECONDS
export default async function liquidateAndRepeat(chainId: number, provider: JsonRpcProvider) {
  const midasSdk = setUpSdk(chainId, provider);
  logger.info(`Config for bot: ${JSON.stringify(midasSdk.chainLiquidationConfig)}`);
  await liquidateOrRetry(midasSdk);
  setTimeout(
    liquidateAndRepeat,
    midasSdk.chainLiquidationConfig.LIQUIDATION_INTERVAL_SECONDS * 1000,
    chainId,
    provider
  );
}
