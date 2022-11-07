import { JsonRpcProvider } from "@ethersproject/providers";

import { Liquidator } from "./services";
import { setUpSdk } from "./utils";

import { config, logger } from "./index";

// Liquidate unhealthy borrows and repeat every LIQUIDATION_INTERVAL_SECONDS
async function runLiquidator(liquidator: Liquidator) {
  const liquidatablePools = await liquidator.fetchLiquidations();

  logger.info(`Found ${liquidatablePools.length} pools with liquidations to process`);

  for (const liquidatablePool of liquidatablePools) {
    logger.info(
      `Liquidating pool: ${liquidatablePool.comptroller} -- ${liquidatablePool.liquidations.length} liquidations found`
    );
    await liquidator.liquidate(liquidatablePool);
  }
}

// Liquidate unhealthy borrows and repeat every LIQUIDATION_INTERVAL_SECONDS
export default async function liquidatePositions(chainId: number, provider: JsonRpcProvider) {
  const midasSdk = setUpSdk(chainId, provider);
  const liquidator = new Liquidator(midasSdk);
  logger.info(`Config for bot: ${JSON.stringify({ ...midasSdk.chainLiquidationConfig, ...config })}`);
  setInterval(runLiquidator, midasSdk.chainLiquidationConfig.LIQUIDATION_INTERVAL_SECONDS * 1000, liquidator);
}
