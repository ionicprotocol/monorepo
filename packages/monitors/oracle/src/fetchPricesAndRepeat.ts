import { JsonRpcProvider } from "@ethersproject/providers";

import { setUpSdk, fetchAssetPrices } from "./index";

export default async function fetchPricesAndRepeat(chainId: number, provider: JsonRpcProvider) {
  const fuse = setUpSdk(chainId, provider);

  const [tx, lastTransactionSentTime] = await fetchAssetPrices(fuse);
  setTimeout(
    fetchPricesAndRepeat,
    parseInt(process.env.CHECK_PRICE_INTERVAL || "300") * 1000,
    chainId,
    provider,
    tx,
    lastTransactionSentTime
  );
}
