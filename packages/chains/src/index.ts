import { ChainConfig } from "@midas-capital/types";

import { default as bsc } from "./bsc";
import { default as polygon } from "./polygon";
import { default as moonbeam } from "./moonbeam";
import { default as neondevnet } from "./neondevnet";
import { default as chapel } from "./chapel";
import { default as ganache } from "./ganache";
import { default as arbitrum } from "./arbitrum";

export { default as bsc } from "./bsc";
export { default as polygon } from "./polygon";
export { default as moonbeam } from "./moonbeam";
export { default as ganache } from "./ganache";
export { default as neondevnet } from "./neondevnet";
export { default as evmos } from "./evmos";
export { default as chapel } from "./chapel";
export { default as arbitrum } from "./arbitrum";

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
    [bsc.chainId]: bsc,
    [polygon.chainId]: polygon,
    [moonbeam.chainId]: moonbeam,
    [neondevnet.chainId]: neondevnet,
    [chapel.chainId]: chapel,
    [ganache.chainId]: ganache,
    [arbitrum.chainId]: arbitrum,
  };
