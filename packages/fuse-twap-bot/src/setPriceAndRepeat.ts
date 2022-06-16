import { JsonRpcProvider, TransactionResponse } from "@ethersproject/providers";

import { setUpSdk, tryUpdateCumulativePrices } from "./index";

export default async function setPriceAndRepeat(
  chainId: number,
  provider: JsonRpcProvider,
  transaction: TransactionResponse | null,
  lastTransactionSent: number | null
) {
  const fuse = setUpSdk(chainId, provider);

  const [tx, lastTransactionSentTime] = await tryUpdateCumulativePrices(fuse, transaction, lastTransactionSent);
  setTimeout(
    setPriceAndRepeat,
    parseInt(process.env.TWAP_UPDATE_ATTEMPT_INTERVAL_SECONDS || "5") * 1000,
    chainId,
    provider,
    tx,
    lastTransactionSentTime
  );
}
