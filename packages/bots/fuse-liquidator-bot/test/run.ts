import { JsonRpcProvider } from "@ethersproject/providers";

import { config, liquidateOrRetry, logger, setUpSdk } from "../src";

(async function () {
  const chainId: number = config.chainId;
  const provider = new JsonRpcProvider(config.rpcUrl);
  const midasSdk = setUpSdk(chainId, provider);
  logger.info(`Config for bot: ${JSON.stringify(midasSdk.chainLiquidationConfig)}`);
  await liquidateOrRetry(midasSdk);
})();
