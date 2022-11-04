import { JsonRpcProvider } from "@ethersproject/providers";

import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

import { config, logger } from "./index";

// Liquidate unhealthy borrows and repeat every LIQUIDATION_INTERVAL_SECONDS
export default async function liquidateAndRepeat(chainId: number, provider: JsonRpcProvider) {
  const midasSdk = setUpSdk(chainId, provider);
  logger.info(`Config for bot: ${JSON.stringify({ ...midasSdk.chainLiquidationConfig, ...config })}`);

  const liquidator = new Liquidator(midasSdk);
  const liquidatablePools = await liquidator.fetchLiquidations();

  logger.info(`Found ${liquidatablePools.length} pools with liquidations to process`);

  for (const liquidatablePool of liquidatablePools) {
    logger.info(
      `Liquidating pool: ${liquidatablePool.comptroller} -- ${liquidatablePool.liquidations.length} liquidations found`
    );
    await liquidator.liquidate(liquidatablePool);
  }

  setTimeout(
    liquidateAndRepeat,
    midasSdk.chainLiquidationConfig.LIQUIDATION_INTERVAL_SECONDS * 1000,
    chainId,
    provider
  );
}
