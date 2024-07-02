import { createPublicClient, createWalletClient, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mode } from "viem/chains";

import config from "../src/config";
import { logger } from "../src/logger";
import { Liquidator } from "../src/services";
import { setUpSdk } from "../src/utils";

(async function () {
  const account = privateKeyToAccount(config.adminPrivateKey as Hex);

  const client = createPublicClient({
    chain: mode,
    transport: http(config.rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: mode,
    transport: http(config.rpcUrl),
  });

  const ionicSdk = setUpSdk(config.chainId, client, walletClient);

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
