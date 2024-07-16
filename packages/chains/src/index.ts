import { ChainConfig } from "@ionicprotocol/types";
import { Chain, base as vBase, bob as vBob, mode as vMode, optimism as vOptimism } from "viem/chains";

import { default as base } from "./base";
import { default as bob } from "./bob";
import { default as mode } from "./mode";
import { default as optimism } from "./optimism";

export const chainIdtoChain: { [chainId: number]: Chain } = {
  [mode.chainId]: vMode,
  [base.chainId]: vBase,
  [optimism.chainId]: vOptimism,
  [bob.chainId]: vBob
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode,
  [base.chainId]: base,
  [optimism.chainId]: optimism,
  [bob.chainId]: bob
};
