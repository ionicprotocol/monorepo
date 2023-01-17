import { ChainConfig } from "@midas-capital/types";

import { default as arbitrum } from "./arbitrum";
import { default as bsc } from "./bsc";
import { default as chapel } from "./chapel";
import { default as evmos } from "./evmos";
import { default as fantom } from "./fantom";
import { default as ganache } from "./ganache";
import { default as moonbeam } from "./moonbeam";
import { default as neondevnet } from "./neondevnet";
import { default as polygon } from "./polygon";

export { bsc, polygon, moonbeam, arbitrum, evmos, chapel, ganache, neondevnet, fantom };

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [arbitrum.chainId]: arbitrum,
  [evmos.chainId]: evmos,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
  [neondevnet.chainId]: neondevnet,
  [fantom.chainId]: fantom,
};
