import { ChainConfig } from "@ionicprotocol/types";

import { default as base } from "./base";
import { default as mode } from "./mode";
import { default as optimism } from "./optimism";

export { mode, base, optimism };

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode,
  [base.chainId]: base,
  [optimism.chainId]: optimism
};
