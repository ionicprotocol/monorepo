import { ChainConfig } from "@ionicprotocol/types";

import { default as arbitrum } from "./arbitrum";
import { default as base } from "./base";
import { default as bsc } from "./bsc";
import { default as chapel } from "./chapel";
import { default as ethereum } from "./ethereum";
import { default as ganache } from "./ganache";
import { default as linea } from "./linea";
import { default as mode } from "./mode";
import { default as neon } from "./neon";
import { default as polygon } from "./polygon";
import { default as zkevm } from "./zkevm";

export { bsc, polygon, arbitrum, ethereum, chapel, ganache, neon, linea, zkevm, mode, base };

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [arbitrum.chainId]: arbitrum,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
  [neon.chainId]: neon,
  [linea.chainId]: linea,
  [ethereum.chainId]: ethereum,
  [zkevm.chainId]: zkevm,
  [mode.chainId]: mode,
  [base.chainId]: base
};
