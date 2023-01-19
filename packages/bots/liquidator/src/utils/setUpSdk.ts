import { JsonRpcProvider } from "@ethersproject/providers";
import { chainIdToConfig } from "@midas-capital/chains";
import { MidasSdk } from "@midas-capital/sdk";

import { logger } from "..";

const setUpSdk = (chainId: number, provider: JsonRpcProvider) => {
  return new MidasSdk(provider, chainIdToConfig[chainId], logger);
};

export default setUpSdk;
