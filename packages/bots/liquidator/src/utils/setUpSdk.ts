import { JsonRpcProvider } from "@ethersproject/providers";
import { bsc, chapel, evmos, fantom, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";
import { MidasSdk } from "@midas-capital/sdk";
import { ChainConfig } from "@midas-capital/types";

import { logger } from "..";

const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [evmos.chainId]: evmos,
  [fantom.chainId]: fantom,
  [neondevnet.chainId]: neondevnet,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
};

const setUpSdk = (chainId: number, provider: JsonRpcProvider) => {
  return new MidasSdk(provider, chainIdToConfig[chainId], logger);
};

export default setUpSdk;
