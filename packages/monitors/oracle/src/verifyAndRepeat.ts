import { JsonRpcProvider } from "@ethersproject/providers";

import { config } from "./config";

import { setUpSdk, updateOracleMonitorData, verify } from "./index";

export default async function fetchPricesAndRepeat(chainId: number, provider: JsonRpcProvider) {
  const fuse = setUpSdk(chainId, provider);

  const results = await verify(fuse);
  await updateOracleMonitorData(results);
  await setTimeout(fetchPricesAndRepeat, config.checkPriceInterval, chainId, provider);
}
