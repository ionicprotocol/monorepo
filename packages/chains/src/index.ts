import { ChainConfig } from "@ionicprotocol/types";

import { default as base } from "./base";
import { default as mode } from "./mode";

export { mode, base };

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode,
  [base.chainId]: base
};
