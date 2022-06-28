import { JsonRpcProvider } from "@ethersproject/providers";
import { SupportedChains } from "@midas-capital/sdk";

import { fetchAssetPrices, logger, setUpSdk } from "../src";

(async function () {
  const chainId: number = process.env.TARGET_CHAIN_ID ? parseInt(process.env.TARGET_CHAIN_ID) : SupportedChains.ganache;
  const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_URL);
  const fuse = setUpSdk(chainId, provider);

  const [tx, lastTransactionSentTime] = await fetchAssetPrices(fuse);
  logger.info(`Tx sent: ${tx} at ${lastTransactionSentTime}`);
})();
