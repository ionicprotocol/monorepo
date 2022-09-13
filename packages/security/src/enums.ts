import { bsc, chapel, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";
import { ChainConfig } from "@midas-capital/types";

export const heartbeatToSeconds = {
  "1m": 60,
  "10m": 60 * 10,
  "15m": 60 * 15,
  "24h": 24 * 60 * 60,
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [neondevnet.chainId]: neondevnet,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
};
