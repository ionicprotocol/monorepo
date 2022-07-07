import { JsonRpcProvider } from "@ethersproject/providers";
import { SupportedChains } from "@midas-capital/sdk";

import { setUpSdk, verifyPriceFeed } from "../src";

(async function () {
  const chainId: number = process.env.TARGET_CHAIN_ID ? parseInt(process.env.TARGET_CHAIN_ID) : SupportedChains.ganache;
  const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_URL);
  const fuse = setUpSdk(chainId, provider);
  await verifyPriceFeed(fuse, fuse.supportedAssets.find((a) => a.symbol === "BOMB")!);
})();
