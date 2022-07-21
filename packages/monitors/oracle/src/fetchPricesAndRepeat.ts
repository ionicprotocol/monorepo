import { JsonRpcProvider } from "@ethersproject/providers";

import { config } from "./config";

import { fetchAssetPrices, setUpSdk } from "./index";

export default async function fetchPricesAndRepeat(chainId: number, provider: JsonRpcProvider) {
  const fuse = setUpSdk(chainId, provider);

  const [tx, lastTransactionSentTime] = await fetchAssetPrices(fuse);
  setTimeout(fetchPricesAndRepeat, config.checkPriceInterval, chainId, provider, tx, lastTransactionSentTime);
}
