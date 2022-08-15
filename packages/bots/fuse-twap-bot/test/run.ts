import { JsonRpcProvider } from "@ethersproject/providers";

import { config, logger, setUpSdk, tryUpdateCumulativePrices } from "../src";

(async function () {
  const chainId: number = config.chainId;
  const provider = new JsonRpcProvider(config.rpcUrl);
  const fuse = setUpSdk(chainId, provider);

  const [tx, lastTransactionSentTime] = await tryUpdateCumulativePrices(fuse, null, null);
  logger.info(`Tx sent: ${tx} at ${lastTransactionSentTime}`);
})();
