import { JsonRpcProvider, TransactionResponse } from "@ethersproject/providers";

import { config, setUpSdk, tryUpdateCumulativePrices } from "./index";

export default async function setPriceAndRepeat(
  chainId: number,
  provider: JsonRpcProvider,
  transaction: TransactionResponse | null,
  lastTransactionSent: number | null
) {
  const fuse = setUpSdk(chainId, provider);

  const [tx, lastTransactionSentTime] = await tryUpdateCumulativePrices(fuse, transaction, lastTransactionSent);
  setTimeout(setPriceAndRepeat, config.twapUpdateIntervalSeconds, chainId, provider, tx, lastTransactionSentTime);
}
