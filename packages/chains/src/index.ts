import { ChainConfig } from "@ionicprotocol/types";
import { Chain, base as vBase, mode as vMode, optimism as vOptimism } from "viem/chains";

import { default as base } from "./base";
import { default as mode } from "./mode";
import { default as optimism } from "./optimism";

export { mode, base, optimism };

export const chainIdtoChain: { [chainId: number]: Chain } = {
  [mode.chainId]: vMode,
  [base.chainId]: vBase,
  [optimism.chainId]: vOptimism
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode,
  [base.chainId]: base,
  [optimism.chainId]: optimism
};
