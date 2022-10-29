import { JsonRpcProvider } from "@ethersproject/providers";

import { config } from "./config";

import { setUpSdk, verify } from "./index";

export default async function verifyAndRepeat(chainId: number, provider: JsonRpcProvider) {
  const fuse = setUpSdk(chainId, provider);

  const results = await verify(fuse);
  console.log(results);
  // await updateOracleMonitorData(results);
  await setTimeout(verifyAndRepeat, config.checkPriceInterval, chainId, provider);
}
