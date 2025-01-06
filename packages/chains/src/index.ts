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
import { default as ink } from "./ink";
import { default as lisk } from "./lisk";
import { default as mode } from "./mode";
import { default as optimism } from "./optimism";
import { default as ozeantest } from "./ozeantest";
import { default as superseed } from "./superseed";
import { default as swellchain } from "./swellchain";
import { default as worldchain } from "./worldchain";
export { base, bob, lisk, mode, optimism, fraxtal, superseed, worldchain, ink, swellchain, ozeantest };

export const vInk: Chain = {
  id: 57073,
  name: "Ink",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: { default: { http: ["https://rpc-qnd.inkonchain.com", "https://rpc-gel.inkonchain.com"] } }
};

export const vSwellchain: Chain = {
  id: 1923,
  name: "Swellchain",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: { default: { http: ["https://rpc.ankr.com/swell", "https://swell-mainnet.alt.technology"] } }
};

export const vOzeantest: Chain = {
  id: 7849306,
  name: "Ozean Testnet",
  nativeCurrency: {
    name: "USDX",
    symbol: "USDX",
    decimals: 18
  },
  rpcUrls: { default: { http: ["https://ozean-testnet.rpc.caldera.xyz/http"] } }
};

export const chainIdtoChain: { [chainId: number]: Chain } = {
  [mode.chainId]: vMode,
  [base.chainId]: vBase,
  [optimism.chainId]: vOptimism,
  [bob.chainId]: vBob,
  [fraxtal.chainId]: vFraxtal,
  [lisk.chainId]: vLisk,
  [ink.chainId]: vInk,
  [superseed.chainId]: vSuperseed,
  [worldchain.chainId]: vWorldchain,
  [swellchain.chainId]: vSwellchain,
  [ozeantest.chainId]: vOzeantest
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [mode.chainId]: mode,
  [base.chainId]: base,
  [optimism.chainId]: optimism,
  [bob.chainId]: bob,
  [fraxtal.chainId]: fraxtal,
  [lisk.chainId]: lisk,
  [ink.chainId]: ink,
  [superseed.chainId]: superseed,
  [worldchain.chainId]: worldchain,
  [swellchain.chainId]: swellchain,
  [ozeantest.chainId]: ozeantest
};
