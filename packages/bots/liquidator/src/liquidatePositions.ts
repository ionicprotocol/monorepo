import { Liquidator } from "./services";
import { BotType, LiquidatablePool } from "@ionicprotocol/sdk/dist/cjs/src/modules/liquidation/utils";

// Liquidate unhealthy borrows and repeat every LIQUIDATION_INTERVAL_SECONDS
async function liquidatePositions(liquidator: Liquidator) {
  const { logger } = liquidator.sdk;
  const liquidatablePools = await liquidator.fetchLiquidations<LiquidatablePool>(BotType.Standard);

  logger.info(`Found ${liquidatablePools.length} pools with liquidations to process`);

  for (const liquidatablePool of liquidatablePools) {
    logger.info(
      `Liquidating pool: ${liquidatablePool.comptroller} -- ${liquidatablePool.liquidations.length} liquidations found`
    );
    await liquidator.liquidate(liquidatablePool);
  }
}

export default liquidatePositions;
