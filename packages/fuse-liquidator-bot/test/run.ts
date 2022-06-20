import { JsonRpcProvider } from "@ethersproject/providers";
import { SupportedChains } from "@midas-capital/sdk";

import { liquidateUnhealthyBorrows, logger, setUpSdk } from "../src";

(async function () {
  const chainId: number = process.env.TARGET_CHAIN_ID ? parseInt(process.env.TARGET_CHAIN_ID) : SupportedChains.ganache;
  const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_URL);
  const fuse = setUpSdk(chainId, provider);
  logger.info(`Config for bot: ${JSON.stringify(fuse.chainLiquidationConfig)}`);
  await liquidateUnhealthyBorrows(fuse);
})();
