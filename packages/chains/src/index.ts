import { ChainConfig } from "@ionicprotocol/types";

import { default as arbitrum } from "./arbitrum";
import { default as bsc } from "./bsc";
import { default as chapel } from "./chapel";
import { default as ethereum } from "./ethereum";
import { default as ganache } from "./ganache";
import { default as lineagoerli } from "./lineagoerli";
import { default as neondevnet } from "./neondevnet";
import { default as polygon } from "./polygon";

export { bsc, polygon, arbitrum, ethereum, chapel, ganache, neondevnet, lineagoerli };

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [arbitrum.chainId]: arbitrum,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
  [neondevnet.chainId]: neondevnet,
  [lineagoerli.chainId]: lineagoerli,
  [ethereum.chainId]: ethereum
};
