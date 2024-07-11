import { ChainConfig } from "@ionicprotocol/types";
import { Chain, base as vBase, mode as vMode, optimismSepolia as vOpSepolia, optimism as vOptimism } from "viem/chains";

import { default as base } from "./base";
import { default as mode } from "./mode";
import { default as optimism } from "./optimism";
import { default as sepolia } from "./sepolia";

export { mode, base, optimism, sepolia };

export const chainIdtoChain: { [chainId: number]: Chain } = {
  [mode.chainId]: vMode,
  [base.chainId]: vBase,
  [optimism.chainId]: vOptimism,
  [sepolia.chainId]: vOpSepolia
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode,
  [sepolia.chainId]: sepolia,
  [base.chainId]: base,
  [optimism.chainId]: optimism
};
