import { JsonRpcProvider } from "@ethersproject/providers";

import config from "../src/config";
import { logger } from "../src/logger";
import { Liquidator } from "../src/services";
import { setUpSdk } from "../src/utils";

(async function () {
  const chainId: number = config.chainId;
  const provider = new JsonRpcProvider(config.rpcUrl);
  const ionicSdk = setUpSdk(chainId, provider);

  logger.info(`Config for bot: ${JSON.stringify({ ...ionicSdk.chainLiquidationConfig, ...config })}`);

  const liquidator = new Liquidator(ionicSdk);
  const liquidatablePools = await liquidator.fetchLiquidations();

  logger.info(`Found ${liquidatablePools.length} pools with liquidations to process`);

  for (const liquidatablePool of liquidatablePools) {
    logger.info(
      `Liquidating pool: ${liquidatablePool.comptroller} -- ${liquidatablePool.liquidations.length} liquidations found`
    );
    await liquidator.liquidate(liquidatablePool);
  }
})();
