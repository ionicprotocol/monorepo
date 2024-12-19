import { ChainConfig } from "@ionicprotocol/types";
import {
  Chain,
  base as vBase,
  bob as vBob,
  fraxtal as vFraxtal,
  lisk as vLisk,
  mode as vMode,
  optimism as vOptimism,
  ink as vInk
} from "viem/chains";

import { default as base } from "./base";
import { default as bob } from "./bob";
import { default as fraxtal } from "./fraxtal";
import { default as lisk } from "./lisk";
import { default as mode } from "./mode";
import { default as optimism } from "./optimism";

export { base, bob, lisk, mode, optimism, fraxtal };

export const chainIdtoChain: { [chainId: number]: Chain } = {
  [mode.chainId]: vMode,
  [base.chainId]: vBase,
  [optimism.chainId]: vOptimism,
  [bob.chainId]: vBob,
  [fraxtal.chainId]: vFraxtal,
  [lisk.chainId]: vLisk,
  [ink.chainId]: vInk
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode,
  [base.chainId]: base,
  [optimism.chainId]: optimism,
  [bob.chainId]: bob,
  [fraxtal.chainId]: fraxtal,
  [lisk.chainId]: lisk,
  [ink.chainId]: ink
};
