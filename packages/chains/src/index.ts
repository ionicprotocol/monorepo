import { ChainConfig } from "@ionicprotocol/types";
import {
  Chain,
  base as vBase,
  bob as vBob,
  fraxtal as vFraxtal,
  lisk as vLisk,
  mode as vMode,
  optimism as vOptimism,
  superseed as vSuperseed,
  worldchain as vWorldchain
} from "viem/chains";

import { default as base } from "./base";
import { default as bob } from "./bob";
import { default as fraxtal } from "./fraxtal";
import { default as lisk } from "./lisk";
import { default as mode } from "./mode";
import { default as optimism } from "./optimism";
import { default as superseed } from "./superseed";
import { default as worldchain } from "./worldchain";

export { base, bob, lisk, mode, optimism, fraxtal, superseed, worldchain };

export const chainIdtoChain: { [chainId: number]: Chain } = {
  [mode.chainId]: vMode,
  [base.chainId]: vBase,
  [optimism.chainId]: vOptimism,
  [bob.chainId]: vBob,
  [fraxtal.chainId]: vFraxtal,
  [lisk.chainId]: vLisk,
  [superseed.chainId]: vSuperseed,
  [worldchain.chainId]: vWorldchain
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode,
  [base.chainId]: base,
  [optimism.chainId]: optimism,
  [bob.chainId]: bob,
  [fraxtal.chainId]: fraxtal,
  [lisk.chainId]: lisk,
  [superseed.chainId]: superseed,
  [worldchain.chainId]: worldchain
};
