import { bsc, chapel, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";
import { ChainConfig } from "@midas-capital/types";

import { ChainLinkFeedHeartbeat } from "./types";

export const heartbeatToSeconds: Record<ChainLinkFeedHeartbeat, number> = {
  "27s": 27,
  "30s": 27,
  "1m": 60,
  "5m": 60 * 5,
  "10m": 60 * 10,
  "15m": 60 * 15,
  "6h": 6 * 60 * 60,
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
