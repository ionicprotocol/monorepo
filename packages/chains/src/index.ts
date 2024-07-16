import { ChainConfig } from "@ionicprotocol/types";

import { default as base } from "./base";
import { default as bob } from "./bob";
import { default as mode } from "./mode";
import { default as optimism } from "./optimism";
import { default as sepolia } from "./sepolia";

export { mode, base, optimism, bob, sepolia };

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode,
  [base.chainId]: base,
  [optimism.chainId]: optimism,
  [bob.chainId]: bob,
  // testnet
  [sepolia.chainId]: sepolia
};
